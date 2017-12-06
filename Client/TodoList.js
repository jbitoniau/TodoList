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
			return Promise.resolve();
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
				var onDeleteButtonClick = function (event) {
					this.deleteTask(task._id);
				}.bind(this);

				var onCompleteCheckboxChange = function (event) {
					var updatedTask = {};
					Object.assign(updatedTask, task);
					Object.assign(updatedTask, { complete: !task.complete });
					this.updateTask(task._id, updatedTask);
				}.bind(this);

				return React.createElement(
					'div',
					{ key: index },
					React.createElement('input', { type: 'checkbox', checked: task.complete, onChange: onCompleteCheckboxChange }),
					React.createElement(
						'span',
						{ style: { textDecoration: task.complete ? 'line-through' : null } },
						index,
						' - ',
						task.name,
						' - ',
						task._id
					),
					React.createElement('input', { type: 'button', onClick: onDeleteButtonClick, value: '-' })
				);
			}.bind(this));

			var onAddTaskButtonClick = function (event) {
				this.addTask();
			}.bind(this);
			var addTaskButton = React.createElement('input', { type: 'button', onClick: onAddTaskButtonClick, value: '+' });

			return React.createElement(
				'div',
				null,
				text,
				tasks,
				addTaskButton
			);
		}
	}, {
		key: 'addTask',
		value: function addTask() {
			console.log('addTask');
			var promise = HttpRequest.request('/api/tasks/', 'POST').then(function (response) {
				var newTask = JSON.parse(response);
				var updatedTasks = this.state.tasks.slice();
				updatedTasks.push(newTask);
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this));
			return promise;
		}
	}, {
		key: 'updateTask',
		value: function updateTask(id, updatedTask) {
			console.log('updateTask ' + id);
			var payload = JSON.stringify(updatedTask);
			var headers = { 'Content-Type': 'application/json' };
			var promise = HttpRequest.request('/api/task/' + id, 'PUT', payload, headers).then(function (response) {
				var updatedTask = JSON.parse(response);
				var updatedTasks = this.state.tasks.slice();
				for (var i = 0; i < updatedTasks.length; i++) {
					if (updatedTasks[i]._id === id) {
						updatedTasks[i] = updatedTask;
						break;
					}
				}
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this));
			return promise;
		}
	}, {
		key: 'deleteTask',
		value: function deleteTask(id) {
			console.log('deleteTask ' + id);
			var promise = HttpRequest.request('/api/task/' + id, 'DELETE').then(function (response) {
				var updatedTasks = this.state.tasks.slice();
				for (var i = 0; i < updatedTasks.length; i++) {
					if (updatedTasks[i]._id === id) {
						updatedTasks.splice(i, 1);
						break;
					}
				}
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this));
			return promise;
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