'use strict';

class TodoList extends React.Component {
	constructor(props) {
		super(props);
		this.state = { date: new Date(), tasks: [] };

		HttpRequest.request('/api/tasks', 'GET').then(
			function(response) {
				var tasks = JSON.parse(response);
				this.setState({ tasks: tasks });
				return Promise.resolve();
			}.bind(this)
		);
	}

	componentWillMount() {
		console.log('componentWillMount');
	}

	componentDidMount() {
		//this.interval = setInterval( this.tick, 1000 );
		this.interval = setInterval(() => this.tick(), 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	componentWillReceiveProps(nextProps) {
		console.log('componentWillReceiveProps');
	}

	tick() {
		this.setState({ date: new Date() });
	}

	render() {
		var text = 'Hello ' + this.state.date.toString();
		var tasks = this.state.tasks.map(function(task, index) {
			var onDeleteButtonClick = function(event) {
				console.log('Delete task ' + task.name);
				HttpRequest.request('/api/task/' + task._id, 'DELETE').then(
				function(response) {
					//var tasks = JSON.parse(response);
					//this.setState({ tasks: tasks });
					console.log(">>> " + response);
					return Promise.resolve();
				}.bind(this)
			);

			};
			var onCompleteCheckboxChange = function(event) {
				console.log('Toggle complete task ' + task.name);
				HttpRequest.request('/api/task/'+ task._id, 'PUT').then(
				function(response) {
					console.log(">>> " + response);
					return Promise.resolve();
				}.bind(this));
			};
			return (
				<div key={index}>
					<input type="checkbox" checked={task.complete} onChange={onCompleteCheckboxChange} />
					<span style={{textDecoration: task.complete?'line-through':null}}>{index} - {task.name}</span>
					<input type="button" onClick={onDeleteButtonClick} value="-" />
				</div>
			);
		});

		var onAddTaskButtonClick = function(event) {
			console.log("add task");
			HttpRequest.request('/api/tasks/', 'POST').then(
				function(response) {
					console.log(">>> " + response);
					return Promise.resolve();
				}.bind(this));
		}
		var addTaskButton = <input type="button" onClick={onAddTaskButtonClick} value="+" />

		return (
			<div>
				{text}
				{tasks}
				{addTaskButton}
			</div>
		);
	}
}

// testing class transpiling...
class Rectangle {
	constructor(hauteur, largeur) {
		this.hauteur = hauteur;
		this.largeur = largeur;
	}
}
var p = new Rectangle();
