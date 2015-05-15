/// <reference path="dt/jquery/jquery.d.ts" />

interface PageInfo {
    domain: string;
    path: string;
    saveUrl: string;
}

declare var PageInfo: PageInfo;

jQuery(function($) {
    var $f = $('form'),
        $textarea = $f.find('textarea'),
        $save = $f.find('button[name=save]');

    $textarea.val(JSON.stringify(JSON.parse($textarea.val()), undefined, '    '));

    $save.click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = JSON.parse($textarea.val());

        var body = {
            data: data,
            title: $f.find('input[name=title]').val(),
        };

        $.ajax({
            type: 'PUT',
            url: PageInfo.saveUrl,
            contentType: 'application/json',
            data: JSON.stringify(body),
        }).then(function() {
                console.info('Success!');
            }, function() {
                console.info('Failure!');
            });
    });
});
