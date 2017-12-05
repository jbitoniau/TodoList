'use strict';

class TodoList extends React.Component {
	constructor(props) {
		super(props);
		this.state = { date:new Date() };
	}

	componentWillMount() {
		console.log("componentWillMount");
	}

	componentDidMount() {
		//this.interval = setInterval( this.tick, 1000 );
		 this.interval = setInterval(
	      () => this.tick(),
	      1000
	    );
	}

	componentWillUnmount() {
		clearInterval( this.interval );
  	}

  	componentWillReceiveProps(nextProps) {
		console.log("componentWillReceiveProps");
	}

  	tick() {
  		this.setState( { date:new Date() } );
  	}

	render() {
		var text = "Hello " + this.state.date.toString();
		return <div>{text}</div>;
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
