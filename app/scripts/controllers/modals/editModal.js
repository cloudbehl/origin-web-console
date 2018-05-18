'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftConsole.controller:DeleteModalController
 * @description
 * # ProjectController
 * Controller of the openshiftConsole
 */
angular.module('openshiftConsole')
    .controller('EditModalController', function($scope, APIService, DataService, QuotaService, $uibModalInstance, $filter) {

        var amountAndUnit = $filter('amountAndUnit');
        var usageWithUnits = $filter('usageWithUnits');
        var usageValue = $filter('usageValue');

        var allocatedAmountAndUnit = amountAndUnit($scope.currentCapacity);

        $scope.claim = {}
        $scope.claim.capacity = parseInt(allocatedAmountAndUnit[0]);
        $scope.claim.unit = allocatedAmountAndUnit[1];

        $scope.currentCapacityUnits = angular.copy($scope.claim);

        $scope.claim.capacity += 1;

        $scope.units = [{
            value: "Gi",
            label: "GiB"
        }, {
            value: "Ti",
            label: "TiB"
        }, {
            value: "G",
            label: "GB"
        }, {
            value: "T",
            label: "TB"
        }];

        $scope.expand = function() {
            $scope.updatedCapacity = $scope.claim.capacity + $scope.claim.unit;
            $uibModalInstance.close($scope.updatedCapacity);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.groupUnits = function(unit) {
            switch (unit.value) {
                case 'Gi':
                case 'Ti':
                    return 'Binary Units';
                case 'G':
                case 'T':
                    return 'Decimal Units';
            }
            return '';
        };

        $scope.validateLimitRange = function(form) {
            // Use usageValue filter to normalize units for comparison.
            var requestedValue = $scope.claim.capacity && usageValue($scope.claim.capacity + $scope.claim.unit);
            var currentValue = $scope.currentCapacityUnits.capacity && usageValue($scope.currentCapacityUnits.capacity + $scope.currentCapacityUnits.unit);

            var checkCurrentCapacity = requestedValue <= currentValue
            form.capacity.$setValidity('checkCurrentCapacity', !checkCurrentCapacity);
        };

    });
