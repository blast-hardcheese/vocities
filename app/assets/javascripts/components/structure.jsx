var SidebarNav = React.createClass({
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
            if (_this.props.editing) {
                link = <TextField content={s.title} updated={_.partial(_this.renameSection, idx)} containerTag='a' href={'#' + s.tag} />;
            } else {
                link = <a href={'#' + s.tag}>{s.title}</a>;
            }

            return <li key={s.tag}>{link}</li>;
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
