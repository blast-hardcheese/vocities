var SidebarNavRow = React.createClass({
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable],

    propTypes: {
        title: React.PropTypes.string.isRequired,
        tag: React.PropTypes.string.isRequired,
    },

    getInitialState: function () {
        return {
            editing: false,
        };
    },

    doUpdate: function (data) {
        var title = data.content;
        var tag = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        this.props.updated({
            tag: tag,
            title: title
        });
        this.stopEdit();
    },

    textFieldEditStopped: function(props, state) {
        this.setState({
            editing: false,
        });
    },

    render: function () {
        return (
            <li key={this.props.tag} style={{position: 'relative'}}>
                {React.createElement(TextField, this.buildProps({
                    content: this.props.title,
                    containerTag: 'a',
                    className: 'v-editable sidebar-nav-row',
                    href: '#' + this.props.tag,
                    editable: this.state.editing,
                    forceEditing: this.state.editing,
                    editStopped: this.textFieldEditStopped,
                    updated: this.doUpdate,
                }))}
                {this.buildEditableButton({
                    className: 'v-editable sidebar-nav-row-edit',
                    style: {
                      position: 'absolute',
                      right: '0',
                      top: '0',
                      backgroundColor: 'red',
                    }
                })}
            </li>
        );
    }
});

var SidebarNav = React.createClass({
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

    anchors: [],
    indexOffsets: [],
    lastOffset: 0,

    rebuildOffsets: _.debounce(function () {
        var self = this;
        var nav = self.refs.nav.getDOMNode();
        var anchors = $('a.sidebar-nav-row', nav);

        var newOffsets = [];

        anchors.each(function(idx, elem) {
            var href = elem.getAttribute('href')
            if (href === null || ! href.startsWith('#')) {
                newOffsets.push(-1);
            } else {
                newOffsets.push(parseInt($(href).offset().top));
                self.lastOffset = idx;
            }
        });

        self.anchors = anchors;
        self.indexOffsets = newOffsets;

        this.handleScroll();
    }, 50),

    handleScroll: function () {
        var scrollY = parseInt(window.scrollY);
        var currentIdx = _.findIndex(this.indexOffsets, function(val) {
            return val > scrollY;
        });

        currentIdx = (currentIdx === -1) ? this.lastOffset : currentIdx - 1;

        $('a.active', nav).removeClass('active');
        $(this.anchors[currentIdx]).addClass('active');
    },

    initScroller: function() {
        this.rebuildOffsets();

        var nav = this.refs.nav.getDOMNode();

        $(window)
            .off('scroll.navbarOffsets')
            .on('scroll.navbarOffsets', _.throttle(this.handleScroll, 50))
            .off('resize.navbarOffsets')
            .on('resize.navbarOffsets', this.rebuildOffsets)
            .off('load.navbarOffsets')
            .on('load.navbarOffsets', this.rebuildOffsets);
    },
    componentDidMount: function() {
        this.initScroller();
    },

    componentDidUpdate: function() {
        this.rebuildOffsets();
    },

    render: function() {
        var self = this;
        var sections = _.map(this.props.sections, function(s, idx) {
            return React.createElement(SidebarNavRow, self.buildProps({
                key: idx,
                title: s.title,
                tag: s.tag,
            }, 'sections.' + idx));
        });

        var newSection = null;
        if (this.props.editable) {
            newSection = <li key="new-section" style={{cursor: 'pointer'}}><a onClick={this.newSectionPopup}>New Section</a></li>;
        }

        return (
            <nav id="nav" ref="nav" style={{position: 'relative'}}>
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
        var headerImage = this.buildDroppable('bannerImage', null, {
            content: 'url(' + this.props.bannerImage + ')',
            height: 'initial',
            backgroundImage: 'initial',
            backgroundPosition: 'initial',
            backgroundRepeat: 'initial',
            backgroundSize: 'initial',
        });

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
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated, Utils.mapUpdated],

    render: function() {
        var copyright = this.propAtPath('footer.copyright');

        return (
            <div className="container">
                <ul className="copyright">
                    <li>&copy; {React.createElement(TextField, this.buildProps({content: copyright, valuemap: {content: 'copyright'}}, 'footer'))}. All rights reserved.</li>
                    <li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                </ul>
            </div>
        );
    },
});
