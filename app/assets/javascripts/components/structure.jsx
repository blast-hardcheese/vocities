var SidebarNav = React.createClass({
    mixins: [Updatable, Editable],

    initScroller: function() {
        var $nav = $('#nav'),
            $nav_a = $nav.find('a[href^=#]');

        var ids = [];

        // Set up nav items.
        $nav_a
            .scrolly()
            .on('click', function(event) {

                var $this = $(this),
                    href = $this.attr('href');

                    // Prevent default behavior.
                    event.preventDefault();

                    // Remove active class from all links and mark them as locked (so scrollzer leaves them alone).
                    $nav_a
                        .removeClass('active')
                        .addClass('scrollzer-locked');

                    // Set active class on this link.
                    $this.addClass('active');

            })
            .each(function() {
                var $this = $(this),
                    href = $this.attr('href'),
                    id;

                    // Add to scrollzer ID list.
                    id = href.substring(1);
                    $this.attr('id', id + '-link');
                    ids.push(id);
            });

        // Initialize scrollzer.
        $.scrollzer(ids, { pad: 300, lastHack: true });
    },
    componentDidMount: function() {
        this.initScroller();
    },

    componentDidUpdate: function() {
        this.initScroller();
    },

    renameSection: function(idx, data) {
        var title = data.content;
        var tag = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        this.props.updated({
            sections: _.map(this.props.sections, function(data, _idx) {
                if (_idx === idx) {
                    data = _.extend({}, data, {
                        title: title,
                        tag: tag,
                    });
                }
                return data;
            }),
        });
    },

    render: function() {
        var _this = this;

        var sections = _.map(this.props.sections, function(s, idx) {
            var link = null;
            if (_this.state.editing) {
                link = <TextField content={s.title} updated={_.partial(_this.renameSection, idx)} containerTag='a' href={'#' + s.tag} />;
            } else {
                link = <a href={'#' + s.tag}>{s.title}</a>;
            }

            return <li key={s.tag}>{link}</li>;
        });

        var toggleEdit = null;
        if (this.props.editable) {
            var style = {
                position: 'absolute',
                top: 0,
                right: 0,
            };

            if (!this.state.editing) {
                toggleEdit = <a onClick={this.startEdit} style={style}>Edit</a>;
            } else {
                toggleEdit = <a onClick={this.stopEdit} style={style}>Done</a>;
            }
        }

        return (
            <nav id="nav" style={{position: 'relative'}}>
                {toggleEdit}
                <ul>
                    {sections}
                </ul>
            </nav>
        );
    }
});

var SocialIcon = React.createClass({
    mixins: [Updatable],

    render: function() {
        var _this = this;

        var icon = this.props.type;
        switch (this.props.type) {
            case 'email':
                icon = 'envelope';
                break;
        }

        var onClick=null;
        if (this.props.editable) {
            onClick = function(e) {
                e.preventDefault();
                console.info('Would edit:', _this.props.type, _this.props.target);
            };
        }

        return (
            <li key={this.props.type}>
                <a href={this.props.target} className={"icon fa-" + icon} onClick={onClick}><span className="label">{this.props.type}</span></a>
            </li>
        );
    },
});


var SidebarFooter = React.createClass({
    render: function() {
        var each = _.map(this.props.social, function(value, key) {
            return <SocialIcon key={key} type={key} target={value} />;
        });
        return <footer>
            <ul className="icons">
                {each}
            </ul>
        </footer>
    },
});
