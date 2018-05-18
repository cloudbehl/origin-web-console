'use strict';

angular.module("openshiftConsole")
.directive("editPvc",
           function($uibModal,
                    $filter,
                    $routeParams,
                    APIService,
                    DataService,
                    ProjectsService,
                    NotificationsService,
                    Logger) {

  return {
    restrict: "E",
    scope: {
      // Resource Kind to edit.
      kind: "@",
      // Optional resource group.
      group: "@?",
      // Optional display name for kind.
      resourceName: "@",
      // The name of the resource's project. Optional if kind === "Project".
      projectName: "@",
      // Alerts object for success and error alerts.
      alerts: "=",
      // Optional link label. Defaults to "Expand".
      label: "@?",
      // Only show a Expand icon with no text.
      buttonOnly: "@",
      // Stay on the current page without redirecting to the resource list.
      stayOnCurrentPage: "=?",
      // Optional redirect URL when the delete succeeds
      redirectUrl: "@?",

      currentCapacity: "@?"
    },
    templateUrl: function(elem, attr) {

      return "views/directives/edit-pvc.html";
    },

    replace: true,
    link: function(scope) {

      var showAlert = function(alert) {
        if (scope.stayOnCurrentPage && scope.alerts) {
          scope.alerts[alert.name] = alert.data;
        } else {
          NotificationsService.addNotification(alert.data);
        }
      };

      var navigateToList = function() {
        if (scope.stayOnCurrentPage) {
          return;
        }
      };

      scope.openEditModal = function() {

        // opening the modal with settings scope as parent
        var modalInstance = $uibModal.open({
          templateUrl: 'views/modals/edit-resource.html',
          controller: 'EditModalController',
          scope: scope
          });

        scope.pvcVersion = APIService.getPreferredVersion('persistentvolumeclaims');

        modalInstance.result.then(function(updatedSize) {
          // upon clicking delete button, delete resource and send alert
          ProjectsService
          .get($routeParams.project)
          .then(_.spread(function(project, context) {
            scope.project = project;
            scope.projectContext = context;
            DataService
              .get(scope.pvcVersion, $routeParams.pvc, context, { errorNotification: false })
              .then(function(pvc) {
               var updatedPvc = angular.copy(pvc);
               updatedPvc.spec.resources.requests.storage = updatedSize;
               var kind = scope.kind;
               var resourceName = scope.resourceName;
               var typeDisplayName = scope.typeDisplayName || $filter('humanizeKind')(kind);
               var formattedResource = _.capitalize(typeDisplayName) + ' ' + "\'"  + (scope.displayName ? scope.displayName : resourceName) + "\'";
               var context = (scope.kind === 'Project') ? {} : {namespace: scope.projectName};

               DataService.update({
                 resource: APIService.kindToResource(kind),
                 // group or undefined
                 group: scope.group
               }, resourceName, updatedPvc, context)
               .then(function() {
                 NotificationsService.addNotification({
                     type: "success",
                     message: formattedResource + " expand request has been submitted."
                 });
                 navigateToList();
               })
               .catch(function(err) {
                 // called if failure to delete
                 showAlert({
                   name: resourceName,
                   data: {
                     type: "error",
                     message: _.capitalize(formattedResource),
                     details: $filter('getErrorDetails')(err)
                   }
                 });
                 Logger.error(formattedResource + " could not be expanded.", err);
               });
              });
          }));
        });
      };
    }
  };
});
