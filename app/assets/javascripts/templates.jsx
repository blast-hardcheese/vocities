var TemplateInits = {
};

var ComplexTemplates = {
    "html5up-read-only": [

    ]
};

var Templates = {
    "0": function() {
        return React.createClass({
            render: function() {
                return (
                    <RootContainer bgColor={this.props.bgColor}>
                        <span>Hello there, {this.props.hello}!</span>
                        <YouTube videoId={this.props.youtube} />
                        <SoundCloudPlayer url={this.props['sc-url']} />
                    </RootContainer>
                );
            },
        });
    },
    "html5up_read_only": function() {
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


        var build = function(selector, _class, dataKey) {
            return {'sel': selector, 'class': _class, 'key': dataKey};
        }

        var sequences = [
            function(vm) {
                var sel = '#header-wrapper';
                var data = vm;
                var clazz = Sidebar;
                console.info('data:', data);

                var factory = React.createFactory(clazz)(data);
                var target = $(sel)[0];
                var react = React.render(factory, target);
                react.setProps(data);
            }
        ];

        return sequences;
    }
}
