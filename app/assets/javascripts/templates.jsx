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
                var sections = _.zip(this.props.keys, this.props.titles).map(function(kv) {
                    return <li key={kv[0]}><a href={kv[0]}>{kv[1]}</a></li>;
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
                var each = [];
                return <footer>
                    {each}
                </footer>
            },
        });

        var Sidebar = React.createClass({
            render: function() {
                return (
                    <section id="header" className="skel-layers-fixed">
                        <SidebarProfile src="https://s.gravatar.com/avatar/b92c6ab7d1f727643880c062d093d460?s=200" name="Devon Stewart" namehref="http://hardchee.se/" flavortext="Hey" />
                        <SidebarNav keys={[]} titles={[]} />
                        <SidebarFooter />
                    </section>
                )
            },
        });


        var build = function(selector, _class, dataKey) {
            return {'sel': selector, 'class': _class, 'key': dataKey};
        }

        var sequences = [
            build('#header-wrapper', Sidebar, 'sidebar'),
        ];

        return sequences;
    }
}
