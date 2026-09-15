define(['metadata'], function (metadata) {
    var Spotboard = {
        __version__: metadata.__version__,
        config: window.config,
        JST: {}
    };
    window.Spotboard = Spotboard;
    return Spotboard;
});
