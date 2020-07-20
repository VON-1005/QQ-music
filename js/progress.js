(function(window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot)
    }
    Progress.prototype = {
        constructor: Progress,
        init: function($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar
            this.$progressLine = $progressLine
            this.$progressDot = $progressDot
        },
        isMove: false,
        progressClick: function(callBack) {
            var $this = this
            this.$progressBar.click(function(e) {
                var normalLeft = $(this).offset().left
                var eventLeft = e.pageX
                $this.$progressLine.css('width', eventLeft - normalLeft)
                $this.$progressDot.css('left', eventLeft - normalLeft)

                var value = (eventLeft - normalLeft) / $(this).width()
                callBack(value)
            })


        },
        progressMove: function(callBack) {
            var normalLeft = this.$progressBar.offset().left
            var eventLeft
            var $this = this
            this.$progressBar.mousedown(function() {
                $this.isMove = true

                $(document).mousemove(function(e) {

                    eventLeft = e.pageX
                    var distance = eventLeft - normalLeft

                    var barlength = parseInt($this.$progressBar.css('width'))
                    if (distance >= 0 && distance <= barlength) {
                        $this.$progressLine.css('width', eventLeft - normalLeft)
                        $this.$progressDot.css('left', eventLeft - normalLeft - parseInt($this.$progressDot.css('width')) / 2)
                    }



                })
            })
            $(document).mouseup(function() {
                $(document).off('mousemove')
                $this.isMove = false
                var value = (eventLeft - normalLeft) / $this.$progressBar.width()
                callBack(value)
                    // $(document).off('mouseup')
            })


        },
        setProgress: function(value) {
            if (this.isMove) return
            if (value < 0 || value > 100) {
                return
            }
            this.$progressLine.css({
                width: value + "%"
            })
            this.$progressDot.css({
                left: value + "%"
            })
        }

    }
    Progress.prototype.init.prototype = Progress.prototype
    window.Progress = Progress
})(window)