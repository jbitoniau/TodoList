'use strict';

/*
    TodoList
*/
function TodoList(graphCanvas, flightControlsDiv, parameterElements ) {
    this._graphCanvas = graphCanvas;
    this._flightControlsDiv = flightControlsDiv;

    // Current and backed-up graph data windows for each type of data
    var now = new Date().getTime();
    var initialWidth = 10 * 1000;
    var initialX = now - initialWidth / 2;
    this._graphDataWindow = { x: initialX, y: -5, width: initialWidth, height: 40 };
    this._graphDataWindows = {
        acceleration: { x: initialX, y: -4, width: initialWidth, height: 8 },
        angularSpeed: { x: initialX, y: -50, width: initialWidth, height: 100 },
        magneticHeading: { x: initialX, y: -750, width: initialWidth, height: 1500 },
        temperature: { x: initialX, y: -5, width: initialWidth, height: 40 },
        pressure: { x: initialX, y: 1005, width: initialWidth, height: 20 },
        flightControls: { x: initialX, y: -0.7, width: initialWidth, height: 1.9 },
        motorPowerLevels: { x: initialX, y: -0.1, width: initialWidth, height: 1.2 },
        motorPulseWidths: { x: initialX, y: 950, width: initialWidth, height: 1100 },
        rollSpeed: { x: initialX, y: -50, width: initialWidth, height: 100 }
    };

    this._graphDataTypeOptions = {
        acceleration: {
            yPropertyName: ['accelerationX', 'accelerationY', 'accelerationZ'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099'],
                dataPoint: ['#990000', '#009900', '#000099']
            }
        },
        angularSpeed: {
            yPropertyName: ['angularSpeedX', 'angularSpeedY', 'angularSpeedZ'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099'],
                dataPoint: ['#990000', '#009900', '#000099']
            }
        },
        magneticHeading: {
            yPropertyName: ['magneticHeadingX', 'magneticHeadingY', 'magneticHeadingZ'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099'],
                dataPoint: ['#990000', '#009900', '#000099']
            }
        },
        temperature: {
            yPropertyName: ['temperature', 'temperature2'],
            colors: {
                dataLine: ['#990000', '#009900'],
                dataPoint: ['#990000', '#009900']
            }
        },
        pressure: {
            yPropertyName: 'pressure',
            colors: {
                dataLine: '#990000',
                dataPoint: '#990000'
            }
        },
        flightControls: {
            yPropertyName: ['throttle', 'rudder', 'elevators', 'ailerons'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099', '#009999'],
                dataPoint: ['#990000', '#009900', '#000099', '#009999']
            }
        },
        motorPowerLevels: {
            yPropertyName: ['motorPowerLevel0', 'motorPowerLevel1', 'motorPowerLevel2', 'motorPowerLevel3'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099', '#009999'],
                dataPoint: ['#990000', '#009900', '#000099', '#009999']
            }
        },
        motorPulseWidths: {
            yPropertyName: ['motorPulseWidth0', 'motorPulseWidth1', 'motorPulseWidth2', 'motorPulseWidth3'],
            colors: {
                dataLine: ['#990000', '#009900', '#000099', '#009999'],
                dataPoint: ['#990000', '#009900', '#000099', '#009999']
            }
        },
        rollSpeed: {
            yPropertyName: ['measuredRollSpeed', 'targetRollSpeed'],
            colors: {
                dataLine: ['#990000', '#009900'],
                dataPoint: ['#990000', '#009900']
            }
        }
    };

    this._graphData = [];
    this._maxNumGraphDataPoints = null;
    if (isMobileDevice()) {
        this._maxNumGraphDataPoints = 20 * 1000 / 20;
    }
    else {
        this._maxNumGraphDataPoints = 1 * 60 * 1000 / 20;
    }

    this._graphOptions = {
        yPropertyName: null, // initialization takes place later
        clearCanvas: true,
        drawOriginAxes: true,
        drawDataRange: true,
        drawDataGaps: true,
        contiguityThreshold: 25,
        textSize: 12,
        numMaxLinesX: 5,
        numMaxLinesY: 5,
        getPrimaryLinesTextX: GraphDataPresenter.getLinesTextForTime,
        getPrimaryLinesSpacingX: GraphDataPresenter.getPrimaryLinesSpacingForTime,
        getSecondaryLinesSpacingX: GraphDataPresenter.getSecondaryLinesSpacingForTime,
        getPrimaryLinesTextY: GraphDataPresenter.getLinesText,
        getPrimaryLinesSpacingY: GraphDataPresenter.getLinesSpacing,
        getSecondaryLinesSpacingY: GraphDataPresenter.getSecondaryLinesSpacing,
        points: {
            //typicalDataPointXSpacing: 10*60*1000,     // No need if we provide a contiguityThreshold
            maxPointSize: 5,
            maxNumPoints: 500
        },
        colors: {
            /*    clear:'#FFFFFF',
            dataRange: "#EEEEEE",
            dataGaps: "#EEEEEE",
            axesLines: "#AA6666",
            primaryLinesText: '#AA6666',
            primaryLines: '#FFAAAA',
            secondaryLines: '#FFDDDD',*/
            dataLine: '#884444',
            dataPoint: '#884444'
        }
    };

    // The graph controller is responsible for rendering the graph and handling input events to navigate in it
    this._graphController = new GraphController(this._graphCanvas, this._graphData, this._graphDataWindow, this._graphOptions);

    // When the user navigates in the graph (i.e. changes the graph data window), we need to check whether more data needs to be fetched
    this._graphController._onGraphDataWindowChange = this._onGraphDataWindowChange.bind(this);
    this._autoscroll = true;

    // The type of graph data currently being displayed
    this._graphDataType = null;
    this.setGraphDataType('rollSpeed');

    // Flight controls
    this._flightControlsProvider = new FlightControlsProvider();
    this._flightControlsIntervalPeriod = 20; // In milliseconds
    this._flightControlsInterval = null;
    this._debugFakeFlightControls = false;

    // Data transmitter objects
    this._flightControlsSender = null;
    this._telemetryReceiver = null;
    this._onTelemetrySamplesReceivedHandler = this._onTelemetrySamplesReceived.bind(this);

    // Websocket
    this._isConnected = false;
    this._onSocketOpenHandler = this._onSocketOpen.bind(this);
    this._onSocketErrorHandler = this._onSocketError.bind(this);
    this._onSocketCloseHandler = this._onSocketClose.bind(this);
    this._openWebsocket();

    this._onWindowResizeHandler = this._onWindowResize.bind(this);
    window.addEventListener('resize', this._onWindowResizeHandler);
    this._onWindowResize();


    var configureNumberInputElement = function( inputElement, onValueChanged ) {
        var initialValue = null;
        inputElement.addEventListener('focus', 
            function(event) {
                var value = parseFloat(event.target.value);
                if ( !isNaN(value) ) {
                    initialValue = value;
                } else {
                    event.target.value = 0;
                    initialValue = 0;
                }
            }
        );
        inputElement.addEventListener('blur', 
            function(event) {
                var value = parseFloat(event.target.value);
                if ( isNaN(value) ) {
                    event.target.value = initialValue;
                } else if ( value!==initialValue ) {
                    if ( onValueChanged ) {
                        onValueChanged(value);
                    }
                }
            }
        );
        inputElement.addEventListener('keydown', 
            function(event){
                if ( event.keyCode===13 ) {
                    var value = parseFloat(event.target.value);
                    if ( isNaN(value) ) {
                        event.target.value = initialValue;
                    }
                    else if ( value!==initialValue ) {
                        if ( onValueChanged ) {
                            onValueChanged(value);
                            initialValue = value;
                        }
                    }
                } 
            } 
        );
    };

    this._pidTerms = new FlightControls();
    this._pidTerms.pTerm = 0.015,
    this._pidTerms.iTerm = 0.0,
    this._pidTerms.dTerm = 0.0,

    parameterElements.pTermNumberInput.value = this._pidTerms.pTerm;
    parameterElements.iTermNumberInput.value = this._pidTerms.iTerm;
    parameterElements.dTermNumberInput.value = this._pidTerms.dTerm;

    configureNumberInputElement( parameterElements.pTermNumberInput, function(value) { 
        this._pidTerms.pTerm=value;
        parameterElements.pTermNumberInput.value = this._pidTerms.pTerm;
    }.bind(this));
    configureNumberInputElement( parameterElements.iTermNumberInput, function(value) { 
        this._pidTerms.iTerm=value;
        parameterElements.iTermNumberInput.value = this._pidTerms.iTerm;
    }.bind(this));
    configureNumberInputElement( parameterElements.dTermNumberInput, function(value) { 
        this._pidTerms.dTerm=value;
        parameterElements.dTermNumberInput.value = this._pidTerms.dTerm;
    }.bind(this));

    // Events
    this.onGraphDataTypeChanged = null;
    this.onAutoscrollChanged = null;
    this.onConnectionOpen = null;
    this.onConnectionError = null;
    this.onConnectionClose = null;
}

TodoList.prototype.dispose = function() {
    this._closeWebsocket();
};

TodoList.prototype._openWebsocket = function() {
    if (this._websocket) {
        throw new Error('Invalid state');
    }
    var host = window.location.host;
    this._websocket = new WebSocket('ws://' + host);
    this._websocket.addEventListener('open', this._onSocketOpenHandler);
    this._websocket.addEventListener('error', this._onSocketErrorHandler);
    this._websocket.addEventListener('close', this._onSocketCloseHandler);
};

TodoList.prototype._closeWebsocket = function() {
    if (this._websocket === null) {
        throw new Error('Invalid state');
    }

    clearInterval(this._flightControlsInterval);
    this._flightControlsSender.dispose();
    this._flightControlsSender = null;
    this._flightControlsProvider.dispose();
    this._flightControlsProvider = null;
    this._flightControlsSender.dispose();
    this._flightControlsSender = null;

    this._telemetryReceiver.dispose();
    this._telemetryReceiver = null;

    this._websocket.removeEventListener('open', this._onSocketOpenHandler);
    this._websocket.removeEventListener('error', this._onSocketErrorHandler);
    this._websocket.removeEventListener('close', this._onSocketCloseHandler);
    this._websocket.close();
    this._websocket = null;
};

// var gNextTime = performance.now();
// var gLastTime = gNextTime;

TodoList.prototype._onSocketOpen = function(/*??*/) {
    this._isConnected = true;

    // FlightControlsSender
    this._flightControlsSender = new FlightControlsSender(this._websocket);
    
    var getAndSendFlightControls = function() {
        var flightControls = null;

        if ( !this._debugFakeFlightControls ) {
            this._flightControlsProvider.update();
            if (this._flightControlsProvider.isGamepadConnected()) {
                flightControls = this._flightControlsProvider.flightControls;
            } else {
                flightControls = new FlightControls();

// var n = performance.now();
// if (n > gNextTime) {
//     gNextTime = n + 1000;
//     //console.log('FlightControlsProvider: ' + n);
//     flightControls.throttle = 0.51;
//     gLastTime = n;
// } else {
//     flightControls.throttle = 0;
// }
            }
        } else {
            flightControls = new FlightControls();
            var now = performance.now();
            var t = Math.floor(now) % 1000 / 1000;
            flightControls.throttle = Math.sin(Math.PI * 2 * t) / 2 + 0.5;
            t = Math.floor(now) % 2300 / 2300;
            flightControls.rudder = Math.sin(Math.PI * 2 * t) / 2;
            t = Math.floor(now) % 1100 / 1100;
            flightControls.elevators = Math.sin(Math.PI * 2 * t) / 2;
            t = Math.floor(now) % 5000 / 5000;
            flightControls.ailerons = Math.sin(Math.PI * 2 * t) / 2;
        }

        flightControls.pTerm = this._pidTerms.pTerm;
        flightControls.iTerm = this._pidTerms.iTerm;
        flightControls.dTerm = this._pidTerms.dTerm;

        this._flightControlsSender.send(flightControls);
    }.bind(this);

    this._flightControlsInterval = setInterval( getAndSendFlightControls, this._flightControlsIntervalPeriod );

    // TelemetryReceiver
    this._telemetryReceiver = new TelemetryReceiver(this._websocket);
    this._telemetryReceiver.onTelemetrySamplesReceived = this._onTelemetrySamplesReceivedHandler;

    if (this.onConnectionOpen) {
        this.onConnectionOpen();
    }
};

TodoList.prototype._onSocketError = function(error) {
    if (this.onConnectionError) {
        this.onConnectionError();
    }
    alert('WebSocket error: ' + error);
};

TodoList.prototype._onSocketClose = function(/*??*/) {
    this._isConnected = false;
    if (this.onConnectionClose) {
        this.onConnectionClose();
    }
};

TodoList.prototype._onTelemetrySamplesReceived = function(telemetrySamples) {
    // Add the samples to the beginning of the graph data array
    // The grapher draws most recent samples at beginning of array first
    //var n = performance.now();
    for (var i = 0; i < telemetrySamples.length; i++) {
        var telemetrySample = telemetrySamples[i];
        telemetrySample.x = telemetrySample.timestamp; // The grapher requires an 'x' property
        this._graphData.splice(0, 0, telemetrySample);
        // if (Math.abs( telemetrySample.throttle-0.51 )<=0.01 ) {
        //     console.log(telemetrySample.throttle + " delta:" + (n-gLastTime).toString() );
        // }
    }

    // If there's a maximum number of samples to hold, enforce it
    if (typeof this._maxNumGraphDataPoints === 'number') {
        var numExcessDataPoints = this._graphData.length - this._maxNumGraphDataPoints;
        if (numExcessDataPoints > 0) {
            this._graphData.splice(-numExcessDataPoints);
        }
    }

    // TODO: move rendering somewhere else
    this._render();

    if (telemetrySamples.length > 0 && telemetrySamples[0].thisWebsocketProvidesFlightControls) {
        this._flightControlsDiv.style.display = 'flex';
        var flightControls = this._flightControlsProvider.flightControls;

        var options = null;
        if (!this._flightControlsProvider.isGamepadConnected()) {
            options = {
                stickFillColor: '#EEEEFF',
                stickStrokeColor: '#AAAAFF',
                knobFillColor: '#CCCCFF',
                knobStrokeColor: '#9999FF'
            };
        }

        var canvas = this._flightControlsDiv.getElementsByTagName('canvas')[0];
        FlightControlsPresenter.render(canvas, flightControls, options);
    } else {
        this._flightControlsDiv.style.display = 'none';
    }
};

TodoList.prototype.getAutoscroll = function() {
    return this._autoscroll;
};

TodoList.prototype.setAutoscroll = function(autoscroll) {
    if (this._autoscroll === autoscroll) {
        return;
    }

    this._autoscroll = autoscroll;

    if (this._autoscroll) {
        this._scrollToLatestData();
        this._render();
    }

    if (this.onAutoscrollChanged) {
        this.onAutoscrollChanged();
    }
};

TodoList.prototype.getGraphDataType = function() {
    return this._graphDataType;
};

TodoList.prototype.setGraphDataType = function(graphDataType) {
    if (graphDataType === this._graphDataType) {
        return;
    }
    if (this._graphDataType) {
        // Remember current graph data y/height for current data type
        this._graphDataWindows[this._graphDataType].y = this._graphDataWindow.y;
        this._graphDataWindows[this._graphDataType].height = this._graphDataWindow.height;
    }

    // Change data type
    var prevGraphDataType = this._graphDataType;
    this._graphDataType = graphDataType;
    Object.assign(this._graphOptions, this._graphDataTypeOptions[this._graphDataType]);

    // Restore graph data y/height for new current type of data to display
    this._graphDataWindow.y = this._graphDataWindows[this._graphDataType].y;
    this._graphDataWindow.height = this._graphDataWindows[this._graphDataType].height;

    // Render graph
    this._graphController.render();

    // Notify
    if (this.onGraphDataTypeChanged) {
        this.onGraphDataTypeChanged(prevGraphDataType, this._graphDataType);
    }
};

TodoList.prototype._render = function() {
    if (this._autoscroll) {
        this._scrollToLatestData();
    }

    GraphDataPresenter.render(this._graphCanvas, this._graphData, this._graphDataWindow, this._graphOptions);
};

TodoList.prototype._onGraphDataWindowChange = function(prevGraphDataWindow) {
    if (this.getAutoscroll()) {
        if (this._graphDataWindow.x !== prevGraphDataWindow.x) {
            this.setAutoscroll(false);
        }
    }
};

// Change the x position of the graph data window to show the latest data points.
// This method doesn't affect the other graph data window properties.
TodoList.prototype._scrollToLatestData = function() {
    var graphData = this._graphData;
    if (graphData.length === 0) {
        return;
    }
    var latestDataPoint = graphData[0];
    this._graphDataWindow.x = latestDataPoint.x - this._graphDataWindow.width;
};

TodoList.prototype._onWindowResize = function(event) {
    var width = window.innerWidth;
    var numPoints = Math.floor(width / 10);
    this._graphOptions.points.maxNumPoints = numPoints;
};

/*
    isMobileDevice
*/
function isMobileDevice() {
    // http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    // http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
    // http://detectmobilebrowsers.com/
    if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
}
