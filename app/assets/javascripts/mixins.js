var Updatable = {
    propTypes: {
        updated: React.PropTypes.func.isRequired,
    },

    deepUpdated: function (key, data) {
        this.props.updated(deepExtend(key, this.props, data));
    },

    getDefaultProps: function() {
        return {
            updated: function (newProps) {
                console.error(this, 'tried to update:', newProps);
            }
        };
    },
};

var Editable = {
    propTypes: {
        editable: React.PropTypes.bool,
    },

    buildEditableButton: function () {
        var label = 'Edit',
            target = this.startEdit;

        if (this.state.editable) {
            label = 'Done';
            target = this.stopEdit;
        }

        var elem = React.createElement("a", {
            cursor: 'pointer',
            onClick: target,
        }, label);

        return this.props.editable ? elem : null;
    },

    extendPropsEditable: function(props) {
        var _this = this;
        return _.extend({}, props, {
            editable: _this.props.editable,
        });
    },

    getInitialState: function() {
        return {
            editing: false,
        };
    },

    startEdit: function() {
        if (!this.props.editable) {
            console.error(this, 'called startEdit when not editable!');
        }
        this.setState({
            editing: true,
        });
    },

    stopEdit: function () {
        if (!this.props.editable) {
            console.error(this, 'called stopEdit when not editable!');
        }
        this.setState({
            editing: false,
        });
    },

    componentDidUpdate: function (prevProps, prevState) {
        if (this.state.editing && !prevState.editing) {
            if(this.editStarted) {
                this.editStarted();
            } else {
                console.info(this.getDOMNode(), 'editStarted');
            }
        }
    },

    componentWillUpdate: function (nextProps, nextState) {
        if (this.state.editing && !nextState.editing) {
            if(this.editStopped) {
                this.editStopped();
            } else {
                console.info(this.getDOMNode(), 'editStopped');
            }
        }
    },
};
