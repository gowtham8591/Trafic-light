var traffic= angular.module('cityRoads',[])
traffic.controller('traficCtrl', ['$scope', function($scope){
    
    $scope.states = [{
        lineWidth: 6,
        strokeStyle: 'white',
        radius: 60,
        state: 'green',
        interval: 3000
    },{
        lineWidth: 6,
        strokeStyle: 'white',
        radius: 60,
        state: 'red',
        reverse: true,
        interval: 3000
    }];
    
    $scope.stopAllStates = function(){
        for(var i = 0;i < $scope.states.length;i++){
            $scope.states[i].state = 'red';
        }
    };
        
}])
  

.service('svgService', [ function(){
    
    var service = {
      changeColor : function(canvas,attrsState,parentState){

        if(attrsState === parentState){
          canvas.fillStyle = attrsState;  
        } else {
          canvas.fillStyle = '#ccc';
        }
        canvas.fill();
        canvas.stroke();
         
        return canvas;
      },
      
      setUpStopLight : function(canvas,options){
                canvas.beginPath();
                canvas.arc(options.width/2,options.height/2, options.radius, 0, 12 * Math.PI, false);
                canvas.lineWidth = options.lineWidth;
                canvas.strokeStyle = options.strokeStyle;
                this.changeColor(canvas,options.attrsState,options.state);
      }
    };
    
    return service;
    
        
}])
.controller('stopLightCtrl', ['$scope','$interval', function($scope,$interval){
    
    this.options = $scope.options;
    
    this.setNextState = function(){
        state = $scope.options.state;
        if($scope.options.reverse === true){
            $scope.options.state =  state==='red'?'yellow':state==='yellow'?'green':'red';
        } else {
          $scope.options.state =  state==='red'?'green':state==='yellow'?'red':'yellow';   
        }
    };
    
    $interval(this.setNextState,this.options.interval);
    
        
}]).directive('stopLightContainer', [ function() {
    return {
        controller: 'stopLightCtrl',
        scope: {options: '='},
    };
}]).directive('stopLight', ['svgService', function(svgService) {
    return {
        require: '^stopLightContainer',
        scope: {},
        compile: function(tElem, tAttrs){
          if ( tElem[0].tagName !== 'CANVAS' ) {
              throw new Error('StopLight can only be a canvas element. ' + tElem[0].tagName + ' will not work.');
          }
          return function(scope,element,attrs,stopLightCtrl) {
            
            var context = element[0].getContext('2d');
            
            scope.options =  angular.extend({ 
              attrsState: attrs.state,
              height: element[0].height,
              width: element[0].width
            },stopLightCtrl.options);

            function getStopLightState(){
              return stopLightCtrl.options.state;
            }
            
            svgService.setUpStopLight(context,scope.options);
          
            scope.$watch(getStopLightState, function(newV,oldV){
              if(newV !== oldV){
                svgService.changeColor(context,scope.options.attrsState,newV);
              }
            });
        }   
        }
    };
}]).directive('fastClicker', function () {
    return {
        restrict:'EA',
        templateUrl: 'directives/communicationExamples/fastClicker.tpl.html',
        require: '^stopLightContainer',
        link: function(scope, element, attrs, ctrl){
            
           scope.canClick = function(){
             if(ctrl.options.state === 'green'){
                return true;
             } else {
                return false;
             }
           };
        }
    };
});