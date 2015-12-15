/// <reference path="dt/all.d.ts" />

interface PageInfo {
    domain: string;
    path: string;
    saveUrl: string;
}

interface PageMeta {
    title: string;
}

interface PageData {
    data: any;
    _meta: PageMeta;
}

declare var PageInfo: PageInfo;
declare var PageData: PageData;

function deepGet(object: any, ...keys: string[]): any {
    return _.foldl(keys, function (retval, key: string) {
        return (retval !== undefined && retval !== null) ? retval[key] : undefined;
    }, object);
}

function deepSet(object: any, value: any, ...keys: string[]): void {
    var target = _.foldl(_.take(keys, keys.length - 1), function (retval, key: string) {
        if (retval[key] === undefined) {
            retval[key] = {};
        }
        return retval[key];
    }, object);

    target[_.last(keys)] = value;
}

jQuery(function($) {
    var $f = $('form'),
        $textarea = $f.find('textarea'),
        $save = $f.find('button[name=save]');

    function updateTextArea() {
        $textarea.val(JSON.stringify(PageData, undefined, '    '));
    }

    $save.click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        var _pageData = _.extend({}, PageData);

        delete _pageData['_meta'];

        var postData = {
            title: PageData._meta.title,
            data: _pageData,
        };

        $.ajax({
            type: 'PUT',
            url: PageInfo.saveUrl,
            contentType: 'application/json',
            data: JSON.stringify(postData),
        }).then(function() {
                console.info('Success!');
                toastr.success('Success!');
            }, function() {
                console.info('Failure!');
                toastr.success('Failed, please make sure data is valid');
            });
    });

    $('#title')
        .val(deepGet(PageData, '_meta', 'title'))
        .typeWatch({
            callback: function (value) {
                deepSet(PageData, value, '_meta', 'title');

                updateTextArea();
            },
            wait: 750,
            highlight: true,
            captureLength: 0
        });

    $('#custom-code')
        .val(deepGet(PageData, 'metadata', 'custom'))
        .typeWatch({
            callback: function (value) {
                if (value.length === 0) {
                    var metadata = deepGet(PageData, 'metadata');
                    delete metadata['custom'];
                } else {
                    deepSet(PageData, value, 'metadata', 'custom');
                }


                updateTextArea();
            },
            wait: 750,
            highlight: true,
            captureLength: 0
        });

    $('#ga-trackingId')
        .val(deepGet(PageData, 'metadata', 'ga', 'trackingId'))
        .typeWatch({
            callback: function (value) {
                if (value.length === 0) {
                    var metadata = deepGet(PageData, 'metadata');
                    delete metadata['ga'];
                } else {
                    deepSet(PageData, value, 'metadata', 'ga', 'trackingId');
                }

                updateTextArea();
            },
            wait: 750,
            highlight: true,
            captureLength: 0
        });

    updateTextArea();
});
