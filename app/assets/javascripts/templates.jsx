var Widget = React.createClass({
    render: function() {
        var res = null;
        switch (this.props.data.type) {
            case 'soundcloud':
                res = React.createElement(SoundCloudPlayer, this.props.data);
                break;
        }

        return res;
    },
});

var TemplateInits = {
    "html5up-read-only": function() {
        skel.init({
            reset: 'full',
            breakpoints: {
                global: { href: 'assets/stylesheets/html5up-read-only/style.css', containers: '45em', grid: { gutters: ['2em', 0] } },
                xlarge: { media: '(max-width: 1680px)', href: 'assets/stylesheets/html5up-read-only/style-xlarge.css' },
                large: { media: '(max-width: 1280px)', href: 'assets/stylesheets/html5up-read-only/style-large.css', containers: '42em', grid: { gutters: ['1.5em', 0] }, viewport: { scalable: false } },
                medium: { media: '(max-width: 1024px)', href: 'assets/stylesheets/html5up-read-only/style-medium.css', containers: '85%!' },
                small: { media: '(max-width: 736px)', href: 'assets/stylesheets/html5up-read-only/style-small.css', containers: '90%!', grid: { gutters: ['1.25em', 0] } },
                xsmall: { media: '(max-width: 480px)', href: 'assets/stylesheets/html5up-read-only/style-xsmall.css' }
            },
            plugins: {
                layers: {
                    config: {
                        mode: 'transform'
                    },
                    titleBar: {
                        breakpoints: 'medium',
                        width: '100%',
                        height: 44,
                        position: 'top-left',
                        side: 'top',
                        html: '<span class="toggle" data-action="toggleLayer" data-args="sidePanel"></span><span class="title" data-action="copyText" data-args="logo"></span>'
                    },
                    sidePanel: {
                        breakpoints: 'medium',
                        hidden: true,
                        width: { small: 275, medium: '20em' },
                        height: '100%',
                        animation: 'pushX',
                        position: 'top-right',
                        side: 'right',
                        orientation: 'vertical',
                        clickToHide: true,
                        html: '<div data-action="moveElement" data-args="header"></div>'
                    }
                }
            }
        });
    },
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
    "html5up-read-only": function() {
        // Sections:
        //   { title: 'blah', tag='foo', content: {} }
        return React.createClass({
            bindEvents: function() {
                jQuery(function($) {
                    var $nav = $('#nav'),
                        $nav_a = $nav.find('a');

                    // Header.
                    var ids = [];

                    if ($nav_a.length === 0) return; // Bail

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
                });
            },
            getDefaultProps: function() {
                return {
                    sections: [],
                };
            },
            getInitialState: function() {
                return {
                };
            },
            componentDidMount: function() {
                this.bindEvents();
            },
            componentWillReceiveProps: function(newProps, oldProps) {
                if (oldProps === null) {
                }

                this.bindEvents();
            },
            render: function() {
                var sectionHeaders = _.map(this.props.sections, function(s) { return (
                    <li key={'li-' + s.tag}>
                        <a href={'#' + s.tag}>{s.title}</a>
                    </li>
                ); });
                var sectionContent = _.map(this.props.sections, function(s) { return (
                    <section key={'section-' + s.tag} id={s.tag}>
                        <div className='container'><Widget data={s.content} /></div>
                    </section>
                ); });

                return (
                    <div id="wrapper">
                        <section id="header" className="skel-layers-fixed">
                            <header>
                            </header>
                            <nav id="nav">
                                <ul>
                                    {sectionHeaders}
                                </ul>
                            </nav>
                            <footer>
                                <ul className="icons">
                                    <li><a href="#" className="icon fa-twitter"><span className="label">Twitter</span></a></li>
                                    <li><a href="#" className="icon fa-facebook"><span className="label">Facebook</span></a></li>
                                    <li><a href="#" className="icon fa-instagram"><span className="label">Instagram</span></a></li>
                                    <li><a href="#" className="icon fa-github"><span className="label">Github</span></a></li>
                                    <li><a href="#" className="icon fa-envelope"><span className="label">Email</span></a></li>
                                </ul>
                            </footer>
                        </section>

                        <div id="main">
                            {sectionContent}
                        </div>

                        <section id="footer">
                            <div className="container">
                                <ul className="copyright">
                                    <li>&copy; Untitled. All rights reserved.</li><li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                                </ul>
                            </div>
                        </section>

                    </div>
                );
            }
        });
    },
}
