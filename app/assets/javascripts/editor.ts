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
