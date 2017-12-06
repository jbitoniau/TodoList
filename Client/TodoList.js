'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TodoList = function (_React$Component) {
	_inherits(TodoList, _React$Component);

	function TodoList(props) {
		_classCallCheck(this, TodoList);

		var _this = _possibleConstructorReturn(this, (TodoList.__proto__ || Object.getPrototypeOf(TodoList)).call(this, props));

		_this.state = { date: new Date(), tasks: [] };

		HttpRequest.request('/api/tasks', 'GET').then(function (response) {
			var tasks = JSON.parse(response);
			this.setState({ tasks: tasks });
		}.bind(_this));
		return _this;
	}

	_createClass(TodoList, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			console.log('componentWillMount');
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this2 = this;

			//this.interval = setInterval( this.tick, 1000 );
			this.interval = setInterval(function () {
				return _this2.tick();
			}, 1000);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			clearInterval(this.interval);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			console.log('componentWillReceiveProps');
		}
	}, {
		key: 'tick',
		value: function tick() {
			this.setState({ date: new Date() });
		}
	}, {
		key: 'render',
		value: function render() {
			var text = 'Hello ' + this.state.date.toString();
			var tasks = this.state.tasks.map(function (task, index) {
				return React.createElement(
					'div',
					{ key: index },
					index,
					' - ',
					task.name
				);
			});
			return React.createElement(
				'div',
				null,
				text,
				tasks
			);
		}
	}]);

	return TodoList;
}(React.Component);

// testing class transpiling...


var Rectangle = function Rectangle(hauteur, largeur) {
	_classCallCheck(this, Rectangle);

	this.hauteur = hauteur;
	this.largeur = largeur;
};

var p = new Rectangle();