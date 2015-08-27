/// <reference path="dt/all.d.ts" />

interface PageInfo {
    domain: string;
    path: string;
    saveUrl: string;
}

interface PageData {
    data: any;
    title: string;
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

    $textarea.val(JSON.stringify(PageData, undefined, '    '));

    $save.click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'PUT',
            url: PageInfo.saveUrl,
            contentType: 'application/json',
            data: JSON.stringify(PageData),
        }).then(function() {
                console.info('Success!');
            }, function() {
                console.info('Failure!');
            });
    });
});
