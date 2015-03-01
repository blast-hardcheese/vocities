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
