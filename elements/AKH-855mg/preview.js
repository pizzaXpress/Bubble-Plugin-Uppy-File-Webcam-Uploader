function(instance, properties) {
console.log('instance.canvas', instance.canvas, 'instance', instance)
instance.canvas.style.border = ' 1px solid grey'
instance.canvas.style.background = "url('https://dd7tel2830j4w.cloudfront.net/f1578670985990x199833086222686900/uppy-logo-2019%20%281%29.svg') center center no-repeat"
instance.canvas.style.height = (properties.bubble.height -2) + 'px'
instance.canvas.style.width = (properties.bubble.width -2)+ 'px'
instance.canvas.style.backgroundColor = '#F5F5F5'
    
}