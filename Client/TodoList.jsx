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
				this.deleteTask( task._id );
			}.bind(this);

			var onCompleteCheckboxChange = function(event) {
				var updatedTask = {};
				Object.assign(updatedTask, task);
				Object.assign(updatedTask, {complete:!task.complete});
				this.updateTask( task._id, updatedTask );
			}.bind(this);

			return (
				<div key={index}>
					<input type="checkbox" checked={task.complete} onChange={onCompleteCheckboxChange} />
					<span style={{ textDecoration: task.complete ? 'line-through' : null }}>
						{index} - {task.name} - {task._id}
					</span>
					<input type="button" onClick={onDeleteButtonClick} value="-" />
				</div>
			);
		}.bind(this));

		var onAddTaskButtonClick = function(event) {
			this.addTask();
		}.bind(this);
		var addTaskButton = <input type="button" onClick={onAddTaskButtonClick} value="+" />;

		return (
			<div>
				{text}
				{tasks}
				{addTaskButton}
			</div>
		);
	}

	addTask() {
		console.log('addTask');
		var promise = HttpRequest.request('/api/tasks/', 'POST').then(
			function(response) {
				var newTask = JSON.parse(response);
				var updatedTasks = this.state.tasks.slice();
				updatedTasks.push(newTask);
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this)
		);
		return promise;
	}

	updateTask( id, updatedTask ) {
		console.log('updateTask ' + id);
		var payload = JSON.stringify(updatedTask);
		var headers = { 'Content-Type':'application/json' };
		var promise = HttpRequest.request('/api/task/' + id, 'PUT', payload, headers).then(
			function(response) {
				var updatedTask = JSON.parse(response);
				var updatedTasks = this.state.tasks.slice();
				for ( var i=0; i<updatedTasks.length; i++ ) {
					if ( updatedTasks[i]._id===id ) {
						updatedTasks[i] = updatedTask;
						break;
					}
				}
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this)
		);		
		return promise;
	}

	deleteTask(id) {
		console.log('deleteTask ' + id);
		var promise = HttpRequest.request('/api/task/' + id, 'DELETE').then(
			function(response) {
				var updatedTasks = this.state.tasks.slice();
				for ( var i=0; i<updatedTasks.length; i++ ) {
					if ( updatedTasks[i]._id===id ) {
						updatedTasks.splice(i, 1);
						break;
					}
				}
				this.setState({ tasks: updatedTasks });
				return Promise.resolve();
			}.bind(this)
		);
		return promise;
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
