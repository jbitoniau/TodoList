'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UITreeView = function (_React$Component) {
	_inherits(UITreeView, _React$Component);

	function UITreeView(props) {
		_classCallCheck(this, UITreeView);

		var _this = _possibleConstructorReturn(this, (UITreeView.__proto__ || Object.getPrototypeOf(UITreeView)).call(this, props));

		_this.state = {
			hovered: false,
			open: true,
			dragHovered: null, // 'firstChild', 'nextSibling'
			inPlaceEditingText: null
		};
		return _this;
	}

	_createClass(UITreeView, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this._dragInfo = this.props._dragInfo;
			if (!this._dragInfo) {
				this._dragInfo = {
					sourceNodeId: null
				};
			}
			this._lastClickTime = null; // for detecting double click on name
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.props.node) {
				return null;
			}

			var node = this.props.node;

			var nodeElement = this.renderNode(node, this.state.hovered, this.props.onNodeCheckedChanged, this.state.inPlaceEditingText);

			var childNodeElements = null;
			if (this.state.open) {
				var childNodes = node.children;
				if (childNodes) {
					childNodeElements = childNodes.map(function (childNode, index) {
						return React.createElement(UITreeView, {
							key: childNode.id,
							node: childNode,
							onNodeKeyDown: this.props.onNodeKeyDown,
							onNodeKeyUp: this.props.onNodeKeyUp,
							onNodeCheckedChanged: this.props.onNodeCheckedChanged,
							onNodeRenamed: this.props.onNodeRenamed,
							onNodeDragging: this.props.onNodeDragging,
							onNodeDropped: this.props.onNodeDropped,
							_dragInfo: this._dragInfo
						});
					}.bind(this));
				}
			}

			var dropPreview = 'line';
			var firstChildDropPositionPreview = null;
			var nextSiblingDropPositionPreview = null;
			if (this.state.dragHovered) {
				if (dropPreview === 'line') {
					// Either this rather discrete representation for drop position preview...
					var marginLeft = UITreeView.expandButtonWidth + UITreeView.checkboxMarginLeftRight;
					if (this.state.dragHovered === 'firstChild') {
						firstChildDropPositionPreview = React.createElement('div', { style: { marginLeft: marginLeft, width: 50, height: 4, backgroundColor: 'grey' } });
					} else if (this.state.dragHovered === 'nextSibling') {
						nextSiblingDropPositionPreview = React.createElement('div', { style: { marginLeft: marginLeft, width: 50, height: 4, backgroundColor: 'grey' } });
					}
				} else {
					// Or this one which shows a dummy node
					var dropPositionPreview = this.renderDummyNode();
					if (this.state.dragHovered === 'firstChild') {
						firstChildDropPositionPreview = dropPositionPreview;
					} else if (this.state.dragHovered === 'nextSibling') {
						nextSiblingDropPositionPreview = dropPositionPreview;
					}
				}
			}

			var style = {};
			Object.assign(style, this.props.style);
			//Object.assign( style, {backgroundColor:createRandomColor()} );

			return React.createElement(
				'div',
				{ style: style },
				nodeElement,
				React.createElement(
					'div',
					{ style: { marginLeft: 14 } },
					firstChildDropPositionPreview,
					childNodeElements
				),
				nextSiblingDropPositionPreview
			);
		}
	}, {
		key: 'renderDummyNode',
		value: function renderDummyNode() {
			var expandButton = React.createElement('div', { style: { flex: '0 0 ' + UITreeView.expandButtonWidth + 'px' } });
			var checkbox = React.createElement('input', {
				type: 'checkbox',
				style: { marginTop: 0, marginBottom: 0, marginLeft: UITreeView.checkboxMarginLeftRight, marginRight: UITreeView.checkboxMarginLeftRight },
				checked: false
			});
			var nameElement = React.createElement(
				'div',
				{ style: { color: 'lightgrey' } },
				'...'
			);
			return React.createElement(
				'div',
				{ style: { border: null, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' } },
				expandButton,
				checkbox,
				nameElement
			);
		}
	}, {
		key: 'renderNode',
		value: function renderNode(node, hovered, onNodeCheckedChanged, inPlaceEditingText) {
			// Main element
			var mainElement = null;
			var onSetRef = function onSetRef(element) {
				mainElement = element;
			};

			var onKeyDown = null;
			var onKeyUp = null;
			var onClick = null;
			if (typeof inPlaceEditingText !== 'string') {
				onKeyDown = function (event) {
					var consumed = false;
					if (this.props.onNodeKeyDown) {
						consumed = this.props.onNodeKeyDown({
							nodeId: this.props.node.id,
							keyCode: event.keyCode,
							repeat: event.repeat,
							altKey: event.altKey,
							shiftKey: event.shiftKey,
							ctrlKey: event.ctrlKey,
							metaKey: event.metaKey
						});
						if (consumed === 'edit') {
							this.setState({ inPlaceEditingText: this.props.node.name });
							consumed = true;
						}
					}
					if (consumed) {
						event.preventDefault();
						event.stopPropagation();
					}
				}.bind(this);

				onKeyUp = function (event) {
					var consumed = false;
					if (this.props.onNodeKeyUp) {
						consumed = this.props.onNodeKeyUp({
							nodeId: this.props.node.id,
							keyCode: event.keyCode,
							altKey: event.altKey,
							shiftKey: event.shiftKey,
							ctrlKey: event.ctrlKey,
							metaKey: event.metaKey
						});
						if (consumed === 'edit') {
							this.setState({ inPlaceEditingText: this.props.node.name });
							consumed = true;
						}
					}
					if (consumed) {
						event.preventDefault();
						event.stopPropagation();
					}
				}.bind(this);

				onClick = function (event) {
					var time = performance.now();
					if (this._lastClickTime !== null) {
						if (time - this._lastClickTime < UITreeView.doubleClickDurationMs) {
							console.log('Double click!');
							this.setState({ inPlaceEditingText: this.props.node.name });
						}
					}
					this._lastClickTime = time;
				}.bind(this);
			}

			var border = null;
			if (hovered) {
				border = '1px dotted grey';
			} else {
				border = '1px solid transparent';
			}
			var onMouseEnter = function (event) {
				if (mainElement) {
					var mainDOMElement = ReactDOM.findDOMNode(mainElement);
					if (mainDOMElement && document.activeElement !== mainDOMElement) {
						mainDOMElement.focus();
					}
				}
				this.setState({ hovered: true });
			}.bind(this);
			var onMouseLeave = function (event) {
				if (mainElement) {
					var mainDOMElement = ReactDOM.findDOMNode(mainElement);
					if (mainDOMElement && document.activeElement === mainDOMElement) {
						mainDOMElement.blur();
					}
				}
				this.setState({ hovered: false, inPlaceEditingText: null }); // Just in case for the in place editing
			}.bind(this);

			// https://www.w3schools.com/html/html5_draganddrop.asp
			// https://www.w3schools.com/jsref/event_ondragover.asp
			// https://stackoverflow.com/questions/11065803/determine-what-is-being-dragged-from-dragenter-dragover-events
			var sourceOnDragStart = function (event) {
				var sourceNodeId = this.props.node.id;
				event.dataTransfer.setData('text', sourceNodeId.toString());
				this._dragInfo.sourceNodeId = sourceNodeId;
				// this.setState( {open:false, wasOpenAtDragStart:this.state.open} );
			}.bind(this);

			var sourceOnDragEnd = function (event) {
				//this.setState( {open:this.state.wasOpenAtDragStart, wasOpenAtDragStart:null} );
			}.bind(this);

			var onNodeDragging = function (sourceNodeId, targetNodeId, relationship) {
				if (this.props.onNodeDragging && this.props.onNodeDragging({ sourceNodeId: sourceNodeId, targetNodeId: targetNodeId, relationship: relationship })) {
					return true;
				}
				return false;
			}.bind(this);

			var targetOnDragOver = function (event) {
				//var sourceNodeId = event.dataTransfer.getData('text');  // NO INFO PROVIDED BY HTML DRAG AND DROP HERE
				var target = event.currentTarget; // the div containing the line for the node
				var rect = target.getBoundingClientRect();
				var x = event.clientX - rect.left; // mouse position inside the target rectangle
				var y = event.clientY - rect.top;

				var relationship = null;
				if (x < 50) {
					relationship = 'nextSibling';
				} else {
					relationship = 'firstChild';
				}

				var sourceNodeId = this._dragInfo.sourceNodeId;
				if (onNodeDragging(sourceNodeId, this.props.node.id, relationship)) {
					if (this.state.dragHovered !== relationship) {
						this.setState({ dragHovered: relationship });
					}
					event.preventDefault();
				}
			}.bind(this);

			var targetOnDragLeave = function (event) {
				if (this.state.dragHovered) {
					this.setState({ dragHovered: null });
				}
				//event.stopPropagation();		// not sure about this
			}.bind(this);

			var targetOnDrop = function (event) {
				var relationship = this.state.dragHovered;
				this.setState({ dragHovered: null });
				event.preventDefault();
				var sourceNodeId = event.dataTransfer.getData('text');
				if (onNodeDragging(sourceNodeId, this.props.node.id, relationship)) {
					if (this.props.onNodeDropped) {
						this.props.onNodeDropped({ sourceNodeId: sourceNodeId, targetNodeId: this.props.node.id, relationship: relationship });
					}
				} else {
					console.warn("onNodeDragging previously allowed drop on this node, but doesn't now on drop");
				}
			}.bind(this);

			// Expand button
			var expandButton = null;
			if (node.children && node.children.length > 0) {
				var expandButtonChild = null;
				if (this.state.open) {
					expandButtonChild = '\u25B6';
				} else {
					expandButtonChild = '\u25BC';
				}

				var onExpandButtonClick = function (event) {
					var open = this.state.open;
					this.setState({ open: !open });
				}.bind(this);

				expandButton = React.createElement(
					'div',
					{ style: { flex: '0 0 ' + UITreeView.expandButtonWidth + 'px', fontSize: 12, color: 'grey' }, onClick: onExpandButtonClick },
					expandButtonChild
				);
			} else {
				expandButton = React.createElement('div', { style: { flex: '0 0 ' + UITreeView.expandButtonWidth + 'px' } });
			}

			// Checkbox
			var onCheckboxChange = function onCheckboxChange(event) {
				if (onNodeCheckedChanged) {
					onNodeCheckedChanged({ nodeId: node.id, checked: event.target.checked });
				}
			};
			var checkbox = React.createElement('input', {
				type: 'checkbox',
				style: {
					flex: '0 0 auto',
					marginTop: 0,
					marginBottom: 0,
					marginLeft: UITreeView.checkboxMarginLeftRight,
					marginRight: UITreeView.checkboxMarginLeftRight
				},
				checked: node.checked,
				onChange: onCheckboxChange
			});

			// Name
			var nameElement = null;
			var nameElementStyle = { flex: '1 1 auto', /*backgroundColor:'lightgrey',*/fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' };
			if (node.checked) {
				Object.assign(nameElementStyle, { textDecoration: 'line-through', color: 'grey' });
			}
			if (typeof inPlaceEditingText !== 'string') {
				nameElement = React.createElement(
					'div',
					{ style: nameElementStyle },
					node.name
				);
			} else {
				//var nameInputElement = null;
				var setNameInputRef = function setNameInputRef(element) {
					//nameInputElement = element;
					var domElement = ReactDOM.findDOMNode(element);
					if (domElement && document.activeElement !== domElement) {
						domElement.focus(); // This seems to cause a problem with firefox
						domElement.select(); // This seems to cause a problem with firefox
					}
				};
				var onNameChange = function (event) {
					this.setState({ inPlaceEditingText: event.target.value });
				}.bind(this);
				var onNameBlur = function (event) {
					console.log('blur');
					this.setState({ inPlaceEditingText: null });
					if (this.props.onNodeRenamed) {
						this.props.onNodeRenamed({ nodeId: this.props.node.id, name: event.target.value });
					}
				}.bind(this);
				var onNameKeyDown = function (event) {
					if (event.keyCode === 27) {
						console.log('esc pressed');
						this.setState({ inPlaceEditingText: null });
					} else if (event.keyCode === 13) {
						console.log('enter pressed');
						this.setState({ inPlaceEditingText: null });
						if (this.props.onNodeRenamed) {
							this.props.onNodeRenamed({ nodeId: this.props.node.id, name: event.target.value });
						}
					}
				}.bind(this);

				Object.assign(nameElementStyle, { outline: 'none', margin: 0, padding: 0, border: 'none' });
				nameElement = React.createElement('input', {
					type: 'text',
					ref: setNameInputRef,
					style: nameElementStyle,
					value: inPlaceEditingText,
					onChange: onNameChange,
					onBlur: onNameBlur,
					onKeyDown: onNameKeyDown
				});
			}

			return React.createElement(
				'div',
				{
					ref: onSetRef,
					tabIndex: 0,
					onKeyDown: onKeyDown,
					onKeyUp: onKeyUp,
					onClick: onClick,
					onMouseEnter: onMouseEnter,
					onMouseLeave: onMouseLeave,
					draggable: true,
					onDragStart: sourceOnDragStart,
					onDragEnd: sourceOnDragEnd
					// onDragEnter={targetOnDragEnter}
					, onDragOver: targetOnDragOver,
					onDragLeave: targetOnDragLeave,
					onDrop: targetOnDrop,
					style: { border: border, outline: 'none', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' } },
				expandButton,
				checkbox,
				nameElement
			);
		}
	}]);

	return UITreeView;
}(React.Component);

UITreeView.propTypes = {
	node: PropTypes.object, // {id, name, checked, chidren}
	onNodeCheckedChanged: PropTypes.func, //func({nodeId, checked})
	onNodeRenamed: PropTypes.func, //func({nodeId, checked})
	onNodeDragging: PropTypes.func, //func({sourceNodeId, targetNodeId, relationship}) with relationship 'firstChild', 'nextSibling'. Must return true to allow drop
	onNodeDropped: PropTypes.func, //func({sourceNodeId, targetNodeId, relativePosition})
	onNodeKeyDown: PropTypes.func, //func({nodeId, keyCode, altKey, shiftKey, ctrlKey, metaKey}). Return true/false to indicate consumption or 'edit' to trigger in-place editing (this will be considered as consumed)
	onNodeKeyUp: PropTypes.func, //func({nodeId, keyCode, keyCode, altKey, shiftKey, ctrlKey, metaKey}). Same return value as onNodeKeyDown
	_dragInfo: PropTypes.object // Nasty hack to work around HTML drag and drop not providing info to target element. Maybe use React context for this kind of thing?
};

UITreeView.defaultProps = {
	node: null,
	onNodeCheckedChanged: null,
	onNodeRenamed: null,
	onNodeDragging: null,
	onNodeDropped: null,
	onNodeKeyDown: null,
	onNodeKeyUp: null,
	_dragInfo: null
};