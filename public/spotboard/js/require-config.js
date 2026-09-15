require.config({
    baseUrl: "js",
    paths: {
        jquery: 'lib/jquery-1.8.2.min',
        handlebars: 'lib/handlebars'
    },
    shim: {
        metadata: { exports: '__meta__' },
        handlebars: { exports: 'Handlebars' },
        contest: { deps: ['jquery'] }
    }
});
