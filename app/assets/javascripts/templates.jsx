// @flow

var Templates = {
    "0": React.createClass({
        render: function() {
            return <RootContainer>
                <span>Hello there, {this.props.hello}!</span>
                <YouTube videoId="04mfKJWDSzI" />
            </RootContainer>;
        },
    })
}
