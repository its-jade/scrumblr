
var StartList = document.getElementById('StartList');
var ProgressList = document.getElementById('ProgressList');
var CompleteList = document.getElementById('CompleteList');

 new Sortable(StartList, {
    group: 'shared', // set both lists to same group
    animation: 150
});

 new Sortable(ProgressList, {
    group: 'shared', // set both lists to same group
    animation: 150
});

 new Sortable(CompleteList, {
    group: 'shared', // set both lists to same group
    animation: 150
});
