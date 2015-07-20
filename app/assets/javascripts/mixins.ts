/// <reference path="dt/all.d.ts" />

var Utils = {
    propAtPath: function (path) {
        var r = this.props;
        if (path !== undefined && path !== null) {
            r = _.foldl(path.split('.'), function (props, key: string) {
                return (props === undefined) ? undefined : props[key];
            }, this.props);
        }
        return r;
    },

    extendProps: function(path) {
        var deepProps = this.propAtPath(path);
        var props = _.extend({key: path}, deepProps);
        return this.buildProps(props, path);
    },

    buildProps: function(props, path) {
        var _this = this;

        var r = _.foldl(this.extendPropsFunctions, function(props, func: Function) {
            return func.apply(_this, [props, path]);
        }, props);
        return r;
    },

    newSectionPopup: function() {
        $('#add-popup').show();
    },

    mapUpdated: function (props) {
        var newprops = props;
        if (newprops.valuemap !== undefined) {
            var map = newprops.valuemap;

            var oldUpdated = props.updated;
            var wrappedUpdated = function (data) {
                data = _.extend({}, data);
                for (var key in map) {
                    data[map[key]] = data[key];
                    delete data[key];
                }
                oldUpdated(data);
            }.bind(this);

            newprops = _.extend({}, props);
            delete newprops.valuemap;
            newprops.updated = wrappedUpdated;
        }
        return newprops;
    },
};

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

    autoUpdated: function(props, path) {
        var newProps = _.extend({}, props);
        if (newProps.updated === undefined) {
            newProps.updated = _.partial(this.deepUpdated, path);
        }
        return newProps;
    }
};

var Editable = {
    propTypes: {
        editable: React.PropTypes.bool.isRequired,
    },

    buildEditableButton: function (attrs) {
        var label = 'Edit',
            target = this.startEdit;

        if (this.state.editing) {
            label = 'Done';
            target = this.stopEdit;
        }

        var elem = React.createElement("a", _.extend({}, {
            cursor: 'pointer',
            onClick: target,
            className: "v-editable",
        }, attrs), label);

        return this.props.editable ? elem : null;
    },

    extendPropsEditable: function(props) {
        var newProps = props;
        if (props.editable === undefined) {
            newProps = _.extend({}, props, {
                editable: this.props.editable,
            });
        }
        return newProps;
    },

    getInitialState: function() {
        return {
            editing: false,
        };
    },

    startEdit: function(e) {
        if (e.target.tagName === 'A' && ! _.contains(e.target.classList, "v-editable")) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (!this.props.editable) {
            console.error(this, 'called startEdit when not editable!');
        }

        if (this.canStartEdit === undefined || this.canStartEdit()) {
            this.setState({
                editing: true,
            });
        }
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

var Droptarget = {
    propTypes: _.extend({}, Editable.propTypes),

    getDefaultProps: function() {
        return {
            dragOver: false,
        };
    },

    dragEnterPage: function(direction) {
        if (! this.props.editable) {
            return;
        }

        if (direction === 'enter') {
            this.setState({
                dragOver: true,
            });
        } else if (direction === 'leave') {
            this.setState({
                dragOver: false,
            });
        } else if (direction === 'drop') {
            this.setState({
                dragOver: false,
            });
        } else {
            console.info('Unknown method', direction);
        }
    },

    componentDidMount: function() {
        if (this.subscriptions === undefined) {
            this.subscriptions = [];
        }

        this.subscriptions.push(EventActions.get('dragStatus').listen(this.dragEnterPage));
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(s) {
            s.stop();
        });
        this.subscriptions.splice(0, this.subscriptions.length);
    },

    onDropUpdateProp: function (propName) {
        var _this = this;
        return function (event) {
            if (! _this.props.editable) {
                return;
            }

            event.preventDefault();

            var file = event.dataTransfer.files[0];

            var data = new FormData();
            data.append('file', file);
            data.append('upload_preset', CloudinarySettings.upload_preset);

            jQuery.ajax({
                url: 'https://api.cloudinary.com/v1_1/' + CloudinarySettings.cloud_name + '/image/upload',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data){
                    var newData = {};
                    newData[propName] = data.url;
                    _this.props.updated(newData);
                },
                error: function() {
                    console.info('error:', arguments);
                }
            });
        };
    },

    buildDroppable: function(propName, attrs, styles) {
        var res = null;
        var commonStyles = {
            height: '15em',
            width: '100%',
        };

        var commonAttrs = {
        };

        if (this.state.dragOver) {
            var dashes = React.createElement("div", {
                style: _.extend({}, commonStyles, styles, {
                    border: "3px dashed black",
                    width: "100%",
                    height: "100%",
                    margin: null,
                }),
            });
            res = React.createElement("div", _.extend({}, {
                style: _.extend({
                    backgroundColor: 'gray',
                    backgroundImage: 'url(/assets/images/drop-here.png)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    padding: "5px",
                }, commonStyles, styles),
                onDrop: this.onDropUpdateProp(propName),
            }, commonAttrs, attrs), dashes);
        } else if(this.props[propName]) {
            res = React.createElement("div", _.extend({}, {
                style: _.extend({
                    backgroundImage: 'url(' + this.props[propName] + ')',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }, commonStyles, styles),
                onDrop: this.onDropUpdateProp(propName),
            }, commonAttrs, attrs));
        }

        return res;
    },
};
