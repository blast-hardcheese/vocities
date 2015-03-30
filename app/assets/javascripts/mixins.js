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

    editStarted: function() {
        console.info(this, 'began editing');
    },

    editStopped: function() {
        console.info(this, 'stopped editing');
    },

    componentDidUpdate: function (prevProps, prevState) {
        if (this.state.editing && !prevState.editing) {
            this.editStarted();
        }
    },

    componentWillUpdate: function (nextProps, nextState) {
        if (this.state.editing && !nextState.editing) {
            this.editStopped();
        }
    },
};
