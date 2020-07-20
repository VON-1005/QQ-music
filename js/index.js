$(function() {
    //自定义滚动条
    $('.content_list').mCustomScrollbar()

    var $audio = $('audio')
    var player = new Player($audio)
    var progress
    var voiceProgress
    var lyric


    //加载歌曲列表
    getPlayerList()

    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function(data) {
                player.musicList = data
                var $musicList = $('.content_list ul')
                $.each(data, function(index, ele) {
                    var $item = createMusicItem(index, ele)

                    $musicList.append($item)
                })

                initMusicInfo(data[0])
                initMusicLyric(data[0])
            },
            error: function(e) {
                console.log(e)
            }
        })
    }

    //初始化歌曲信息
    function initMusicInfo(music) {
        var $musicImage = $('.song_pic img')
        var $musicName = $('.song_name a')
        var $musicSinger = $('.song_singer a')
        var $musicAlbum = $('.song_album a')
        var $progressName = $('.progress_name')
        var $progressTime = $('.progress_time')
        var $musicBg = $('.mask_bg')

        $musicImage.attr('src', music.cover)
        $musicName.text(music.name)
        $musicSinger.text(music.singer)
        $musicAlbum.text(music.album)
        $progressName.text(music.name + " / " + music.singer)
        $progressTime.text("00:00 / " + music.time)
        $musicBg.css('background', 'url("' + music.cover + '")')
    }

    //初始化歌词信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc)
        var $lyricContainer = $('.song_lyric')

        $lyricContainer.html("")
        lyric.loadLyric(function() {
            $.each(lyric.lyrics, function(index, ele) {
                var $item = $("<li>" + ele + "</li>")
                $lyricContainer.append($item)
            })
        })
    }

    //初始化进度条
    initProgress()

    function initProgress() {
        var $progressBar = $('.progress_bar')
        var $progressLine = $('.progress_line')
        var $progressDot = $('.progress_dot')
        progress = new Progress($progressBar, $progressLine, $progressDot)
        progress.progressClick(function(value) {
            player.musicSeekTo(value)
        })
        progress.progressMove(function(value) {
            player.musicSeekTo(value)

        })

        var $voiceBar = $('.voice_bar')
        var $voiceLine = $('.voice_line')
        var $voiceDot = $('.voice_dot')
        voiceProgress = new Progress($voiceBar, $voiceLine, $voiceDot)
        voiceProgress.progressClick(function(value) {
            player.musicVoiceSeekTo(value)
        })
        voiceProgress.progressMove(function(value) {
            player.musicVoiceSeekTo(value)


        })
    }

    initEvents()

    function initEvents() {
        //监听歌曲移入移出时间
        $('.content_list').delegate('.list_music', 'mouseenter', function() {
            $(this).find('.list_menu').stop().fadeIn(100)
            $(this).find('.list_time a').stop().fadeIn(100)
            $(this).find('.list_time span').stop().fadeOut(100)
        })

        $('.content_list').delegate('.list_music', 'mouseleave', function() {
            $(this).find('.list_menu').stop().fadeOut(100)
            $(this).find('.list_time a').stop().fadeOut(100)
            $(this).find('.list_time span').stop().fadeIn(100)
        })

        //监听复选框的点击
        $('.content_list').delegate('.list_check', 'click', function() {
            $(this).toggleClass('checked')
        })

        //子菜单播放按钮的监听
        var $musicplay = $('.music_play')
        $('.content_list').delegate('.menu_play', 'click', function() {
            var $item = $(this).parents('.list_music')
                // $item.get(0).index
            $(this).toggleClass('menu_play2')
            $item.siblings().find('.menu_play').removeClass('menu_play2')
            if ($(this).attr('class').indexOf('menu_play2') != -1) {
                $musicplay.addClass('music_play2')
                $item.find('div').css('color', '#fff')
                $item.siblings().find('div').css('color', 'rgba(255,255,255,0.5)')

            } else {
                $musicplay.removeClass('music_play2')
                $item.find('div').css('color', 'rgba(255,255,255,0.5)')

            }
            $item.find('.list_number').toggleClass('list_number2')
            $item.siblings().find('.list_number').removeClass('list_number2')

            //播放
            player.playMusic($item.get(0).index, $item.get(0).music)

            //切换歌曲信息
            initMusicInfo($item.get(0).music)
            initMusicLyric($item.get(0).music)

        })

        //监听底部播放
        $musicplay.click(function() {
            if (player.currentIndex == -1) {
                $('.list_music').eq(0).find('.menu_play').trigger('click')
            } else {
                $('.list_music').eq(player.currentIndex).find('.menu_play').trigger('click')
            }
        })

        //监听底部上一首
        $('.music_pre').click(function() {
            $('.list_music').eq(player.preIndex()).find('.menu_play').trigger('click')
        })

        //监听底部下一首
        $('.music_next').click(function() {
            $('.list_music').eq(player.nextIndex()).find('.menu_play').trigger('click')
        })

        //监听删除
        $('.content_list').delegate('.menu_del', 'click', function() {
            $item = $(this).parents('.list_music')

            if ($item.get(0).index == player.currentIndex) {
                $('.music_next').trigger('click')
            }
            $item.remove()
            player.changeMusic($item.get(0).index)

            $('.list_music').each(function(index, ele) {
                ele.index = index
                $(ele).find('.list_number').text(index + 1)
            })
        })

        //监听播放进度
        player.musicTimeUpdate(function(duration, currentTime, timeStr) {
            $('.progress_time').text(timeStr)

            var value = currentTime / duration * 100
            progress.setProgress(value)

            var index = lyric.currentIndex(currentTime)
            var $item = $('.song_lyric li').eq(index)
            $item.addClass('cur')
            $item.siblings().removeClass('cur')

            if (index <= 1) return
            $('.song_lyric').css({
                marginTop: ((-index + 1) * 30)
            })
        })

        //监听音量
        $('.voice_icon').click(function() {
            $(this).toggleClass('voice_icon2')
            if ($(this).attr('class').indexOf('voice_icon2') != -1) {
                player.musicVoiceSeekTo(0)
            } else {
                player.musicVoiceSeekTo(1)

            }
        })


    }



    //创建一条音乐
    function createMusicItem(index, music) {
        var $item = $(`<li class="list_music">
        <div class="list_check"><i></i></div>
        <div class="list_number">` + (index + 1) + `</div>
        <div class="list_name">` + music.name + `
            <div class="list_menu">
                <a href="javascript:;" title="播放" class="menu_play"></a>
                <a href="javascript:;" title="添加"></a>
                <a href="javascript:;" title="下载"></a>
                <a href="javascript:;" title="分享"></a>
            </div>
        </div>
        <div class="list_singer">` + music.singer + `</div>
        <div class="list_time">
            <span>` + music.time + `</span>
            <a href="javascript:;" title="删除" class="menu_del"></a>
        </div>
    </li>`)
        $item.get(0).index = index
        $item.get(0).music = music
        return $item
    }





})