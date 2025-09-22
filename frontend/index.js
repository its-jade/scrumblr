var StartList = document.getElementById("start-list");
var ProgressList = document.getElementById("progress-list");
var CompleteList = document.getElementById("completed-list");

new Sortable(StartList, {
  group: "shared", // set both lists to same group
  animation: 150,
});

new Sortable(ProgressList, {
  group: "shared", // set both lists to same group
  animation: 150,
});

new Sortable(CompleteList, {
  group: "shared", // set both lists to same group
  animation: 150,
});
