var Widget = React.createClass({
    render: function() {
        var res = null;
        switch (this.props.data.type) {
            case 'soundcloud':
                res = <SoundCloudPlayer url={this.props.data['sc-url']} />
                break;
        }

        return res;
    },
});

var TemplateInits = {
};

var Templates = {
    "0": React.createClass({
        render: function() {
            return <RootContainer bgColor={this.props.bgColor}>
                <span>Hello there, {this.props.hello}!</span>
                <YouTube videoId={this.props.youtube} />
                <SoundCloudPlayer url={this.props['sc-url']} />
            </RootContainer>;
        },
    })
}
