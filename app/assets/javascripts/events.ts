/// <reference path="dt/all.d.ts" />

var EventActions = (function() {
    var store = {};

    return {
        get: function(name) {
            if (store[name] === undefined) {
                store[name] = Reflux.createAction();
            }

            return store[name];
        },

        register: function(name, newStore) {
            if (store[name] !== undefined) {
                console.error('Replacing', store[name]);
            }
            store[name] = newStore;
        },

        trigger: function(name, data) {
            return EventActions.get(name).trigger(data);
        },
    };
})();

var dragStatusAccumulator = Reflux.createStore({
    init: function() {
        this.dragCount = 0;
        this.listenTo(EventActions.get('_dragStatus'), this.statusChanged);
    },
    statusChanged: function(dragStatus) {
        console.info('Status changed', dragStatus, this.dragCount);
        if (dragStatus === 'enter') {
            this.dragCount += 1;

            if (this.dragCount === 1) {
                this.trigger('enter');
            }
        } else if (dragStatus === 'leave') {
            this.dragCount -= 1;

            if (this.dragCount === 0) {
                this.trigger('leave');
            }
        } else if (dragStatus === 'drop') {
            this.dragCount = 0;
            this.trigger('drop');
        }
    },
});

EventActions.register('dragStatus', dragStatusAccumulator);
