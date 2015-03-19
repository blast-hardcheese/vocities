initComponents = function(key, data) {
    var components = _.map(Templates[key].sequences, function(func) {
        var r = func(data);
        r.setProps(data);
        return r;
    });
};

refreshComponents = function(components, data) {
    _.map(components, function(c) {
        return c.setProps(data);
    });
};

var Templates = {
    "html5up_read_only": (function(self) {
        var SidebarProfile = React.createClass({
            propTypes: {
                src: React.PropTypes.string.isRequired,
                alt: React.PropTypes.string,
                name: React.PropTypes.string.isRequired,
                namehref: React.PropTypes.string,
                flavortext: React.PropTypes.string
            },
            render: function() {
                return (
                    <header>
                        <span className="image avatar"><img src={this.props.src} alt={this.props.alt} /></span>
                        <h1 id="logo"><a href={this.props.namehref}>{this.props.name}</a></h1>
                        <p>{this.props.flavortext}</p>
                    </header>
                );
            },
        });

        var SidebarNav = React.createClass({
            render: function() {
                var sections = _.map(this.props.sections, function(s) {
                    return <li key={s.tag}><a href={'#' + s.tag}>{s.title}</a></li>;
                });
                return (
                    <nav id="nav">
                        <ul>
                            {sections}
                        </ul>
                    </nav>
                );
            }
        });

        var SocialIcon = React.createClass({
            render: function() {
                var icon = this.props.type;
                switch (this.props.type) {
                    case 'email':
                        icon = 'envelope';
                        break;
                }
                return <li key={this.props.type}><a href={this.props.target} className={"icon fa-" + icon}><span className="label">{this.props.type}</span></a></li>;
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

        var Sidebar = React.createClass({
            render: function() {
                return (
                    <section id="header" className="skel-layers-fixed">
                        {React.createElement(SidebarProfile, this.props.sidebar.header)}
                        <SidebarNav sections={this.props.sections} />
                        <SidebarFooter social={this.props.social}/>
                    </section>
                )
            },
        });


        var HeaderBlock = React.createClass({
            render: function() {
                return (
                    <div>
                        <header className="major">
                            <h2>{this.props.title}</h2>
                            <p dangerouslySetInnerHTML={{__html: this.props.subtitle}}></p>
                        </header>
                        <p>{this.props.text}</p>
                    </div>
                );
            }
        });

        var Widget = WidgetBuilder({
            'header': HeaderBlock,
        });

        var Section = React.createClass({
            render: function() {
                return (
                    <section id={this.props.tag}>
                        <div className="container">
                            {React.createElement(Widget, this.props.content)}
                        </div>
                    </section>
                );
            }
        });

        var Main = React.createClass({
            render: function() {
                var sections = _.map(this.props.sections, function(s) {
                    return <Section key={s.tag} tag={s.tag} content={s.content} />
                });
                return (
                    <div id="main">
                        {sections}
                    </div>
                );
            },
        });

        var Footer = React.createClass({
            render: function() {
                var copyright = this.props.footer.copyright;
                return (
                    <div className="container">
                        <ul className="copyright">
                            <li>&copy; {copyright}. All rights reserved.</li>
                            <li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                        </ul>
                    </div>
                );
            },
        });

        var render = function(sel, data, clazz) {
            var factory = React.createFactory(clazz)(data);
            var target = $(sel)[0];
            var react = React.render(factory, target);
            react.setProps(data);
            return react;
        };

        var sequences = [
            function(vm) {
                return render('#header-wrapper', vm, Sidebar);
            },

            function(vm) {
                return render('#main-wrapper', vm, Main);
            },

            function(vm) {
                return render('#footer', vm, Footer);
            },

            function(vm) {
                var dynamicCss = _.template($('#dynamic-tpl').text());
                var dynamicCssValues = JSON.parse($('#dynamic-tpl-values').text());

                var target = $('style#dynamic')

                var setDynamicTemplate = function(template, userValues) {
                    if (userValues !== undefined) {
                        var values = _.extend({}, dynamicCssValues, userValues);
                        var overrides = vm.css.template === undefined ? "" : (_.template(vm.css.template)(values));
                        target.text(dynamicCss(values) + overrides);
                    }
                };

                return {
                    setProps: function(newProps) {
                        if(newProps.css !== undefined) {
                            setDynamicTemplate(newProps.css.template, newProps.css.values);
                        }
                    },
                };
            },

            function(vm) {
                var initMenu = function(newProps) {
                    // Header.
                    var ids = [],
                        $nav = $('#nav'), $nav_a = $nav.find('a');

                    // Set up nav items.
                    $nav_a
                        .scrolly()
                        .off('click')
                        .on('click', function(event) {

                            var $this = $(this),
                            href = $this.attr('href');

                            // Not an internal link? Bail.
                            if (href.charAt(0) != '#')
                            return;

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

                            // Not an internal link? Bail.
                            if (href.charAt(0) != '#')
                            return;

                            // Add to scrollzer ID list.
                            id = href.substring(1);
                            $this.attr('id', id + '-link');
                            ids.push(id);
                        });

                    // Initialize scrollzer.
                    $.scrollzer(ids, { pad: 300, lastHack: true });
                };

                return {
                    setProps: initMenu,
                };
            },
        ];

        self.render = render;
        self.sequences = sequences;
        self.classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
        };

        return self;
    })({})
}
