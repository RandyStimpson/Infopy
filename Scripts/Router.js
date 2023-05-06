app.config(function ($routeProvider) {
    $routeProvider
                .when('/',
                {
                    templateUrl: 'Views/PositionalEntropy.html'
                })

                .when('/DesignPattern',
                {
                    templateUrl: 'Views/DesignPattern.html'
                })

                .when('/NestedDesignPattern',
                {
                    templateUrl: 'Views/NestedDesignPattern.html'
                })

                .otherwise({ redirectTo: '/' });
});

