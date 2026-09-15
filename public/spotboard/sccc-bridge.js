/* Static Spotboard renderer. The parent reads the public CLICS API directly. */
require(['spotboard', 'jquery', 'spotboard.manager'], function (Spotboard, $) {
  var initialized = false;
  config.environment = 'production';
  config.exclude_teams = [];
  config.foreign_teams = [];
  config.auto_play = false;
  config.award_mode = false;
  config.animation = false;
  config.show_events = false;
  config.show_first_solve = false;
  function send(type) { window.parent.postMessage({ type: type }, window.location.origin); }
  function render(snapshot) {
    Spotboard.contest = Contest.createFromJson(snapshot.contest);
    Spotboard.contest.penalty = snapshot.contest.penalty;
    Spotboard.$runs = snapshot.feed;
    $('#problem-balloon-style').remove();
    Spotboard.Manager.feedInitialRuns();
    // Rebuild to reflect rejudging; trust the public API's ranks and totals.
    snapshot.contest.teams.forEach(function (team) {
      var status = Spotboard.contest.getTeamStatus(team.id);
      status.getRank = function () { return team.rank; };
      status.getPenalty = function () { return team.penalty; };
      status.getTotalSolved = function () { return team.solved; };
    });
    Spotboard.contest.getRankedTeamStatusList = function () {
      return snapshot.contest.teams.slice().sort(function (a,b) { return a.rank-b.rank; }).map(function (team) { return Spotboard.contest.getTeamStatus(team.id); });
    };
    Spotboard.View.displayContestInformation();
    Spotboard.View.initStyles();
    Spotboard.View.drawScoreboard();
    $('#time-elapsed').text(Spotboard.Util.toTimeDisplayString(snapshot.feed.time.contestTime));
    if (!initialized) Spotboard.Manager.initSearchEventHandlers();
    $('#search-input').trigger('input');
    initialized = true;
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    if (event.data && event.data.type === 'sccc:hello') { send('sccc:ready'); return; }
    try { if (event.data && event.data.type === 'sccc:board') render(event.data.snapshot); }
    catch (_) { send('sccc:error'); }
  });
  $(function () { send('sccc:ready'); });
});
