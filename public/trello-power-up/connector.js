window.TrelloPowerUp.initialize({
  "card-buttons": function () {
    return [
      {
        text: "📱 VoxTalent",
        callback: function (t) {
          return t.popup({
            title: "VoxTalent",
            url: "./popup.html"
          });
        }
      }
    ];
  }
});
