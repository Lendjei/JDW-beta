/*add some plugins materializecss beginning*/
$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 200, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left' // Displays dropdown with edge aligned to the left of button
}
);

$('.dropdown-button1').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: true, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 200, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'right' // Displays dropdown with edge aligned to the left of button
}
);
$(document).ready(function () {
    $('ul.tabs').tabs();
});
$(document).ready(function () {
    $('.scrollspy').scrollSpy();
});
$(document).ready(function () {
    $('.collapsible').collapsible({
        accordion: true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
});
$('[data-click]').on('click', function (e) {
    $($(this).data('click')).trigger('click');
});


$(document).ready(function () {
    $('.tooltipped').tooltip({delay: 50});
});
        
/*add some plugins materializecss end*/