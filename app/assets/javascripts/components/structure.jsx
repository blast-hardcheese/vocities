var SidebarNav = React.createClass({
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable],

    initScroller: function() {
        var $nav = $('#nav'),
            $nav_a = $nav.find('a[href^=#]');

        var ids = [];

        // Set up nav items.
        $nav_a
//            .scrolly()
            .off('click')
            .on('click', function(event) {

                var $this = $(this),
                    href = $this.attr('href');

                    // Remove active class from all links and mark them as locked (so scrollzer leaves them alone).
                    $nav_a.removeClass('active');

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
            var updated = _.partial(_this.renameSection, idx);
            if (_this.state.editing) {
                link = <TextField content={s.title} updated={updated} containerTag='a' href={'#' + s.tag} editable={_this.props.editable} />;
            } else {
                link = <a href={'#' + s.tag}>{s.title}</a>;
            }

            return <li key={s.tag}>{link}</li>;
        });

        var toggleEdit = null;
        var newSection = null;
        if (this.props.editable) {
            var style = {
                position: 'absolute',
                top: 0,
                right: 0,
                borderBottom: 'none',
            };

            toggleEdit = this.buildEditableButton({style: style});

            newSection = <li key="new-section" style={{cursor: 'pointer'}}><a onClick={this.newSectionPopup}>New Section</a></li>;
        }

        return (
            <nav id="nav" style={{position: 'relative'}}>
                {toggleEdit}
                <ul>
                    {sections}
                    {newSection}
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
        var _this = this;
        var each = _.map(this.props.social, function(value, key) {
            return <SocialIcon editable={_this.props.editable} key={key} type={key} target={value} />;
        });
        return <footer>
            <ul className="icons">
                {each}
            </ul>
        </footer>
    },
});

var HeaderBlock = React.createClass({
    mixins: [Editable, Updatable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated, Utils.mapUpdated],

    render: function() {
        return (
            <div>
                <header className="major">
                    {React.createElement(TextField, this.buildProps({content: this.props.title, valuemap: {content: 'title'}, containerTag: 'h2'}))}
                    {React.createElement(Paragraph, this.buildProps({content: this.props.subtitle, valuemap: {content: 'subtitle'}}))}
                </header>
                {React.createElement(Paragraph, this.buildProps({content: this.props.text, valuemap: {content: 'text'}}))}
            </div>
        );
    }
});

var SidebarProfile = React.createClass({
    mixins: [Updatable, Editable, Utils, Droptarget],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated, Utils.mapUpdated],

    propTypes: {
        src: React.PropTypes.string.isRequired,
        alt: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
        flavortext: React.PropTypes.string
    },

    render: function() {
        return (
            <header>
                {this.buildDroppable('src', null, {
                  borderRadius: '100%',
                  width: '8em',
                  height: '8em',
                  margin: '0 auto 2.25em auto',
                })}
                <h1 id="logo">
                    {React.createElement(TextField, this.buildProps({containerTag: 'div', content: this.props.name, valuemap: {content: 'name'}}))}
                </h1>
                <p>{this.props.flavortext}</p>
            </header>
        );
    },
});

var Sidebar = React.createClass({
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

    render: function() {
        return (
            <section id="header">
                {React.createElement(SidebarProfile, this.extendProps('sidebar.header'))}
                {React.createElement(SidebarNav, this.buildProps({sections: this.props.sections}))}
                {React.createElement(SidebarFooter, this.buildProps({social: this.props.social}))}
            </section>
        )
    },
});

var Section = React.createClass({
    mixins: [Updatable, Editable, Droptarget, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

    render: function() {
        var headerImage = this.buildDroppable('bannerImage');

        return (
            <section id={this.props.tag}>
                {headerImage}
                <div className="container">
                    {React.createElement(WidgetBuilder(), this.buildProps(this.props.content, 'content'))}
                </div>
            </section>
        );
    }
});

var Footer = React.createClass({
    mixins: [Utils],

    copyrightUpdated: function (newProps) {
        this.props.updated(_.extend({}, this.props, {
            footer: _.extend({}, this.props.footer, {
                copyright: newProps.content,
            }),
        }));
    },
    render: function() {
        var copyright = this.propAtPath('footer.copyright');

        return (
            <div className="container">
                <ul className="copyright">
                    <li>&copy; <TextField content={copyright} updated={this.copyrightUpdated} editable={this.props.editable} />. All rights reserved.</li>
                    <li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                </ul>
            </div>
        );
    },
});
