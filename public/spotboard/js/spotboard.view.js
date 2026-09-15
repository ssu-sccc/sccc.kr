define([
    'jquery',
    'handlebars',
    'spotboard',

    'spotboard.util'
],
function($, Handlebars, Spotboard) {

    Spotboard.View = { };
    Spotboard.View.search_filter = '';

    /**
     * contest의 기본 정보들을 DOM에 표시해줌
     */
    Spotboard.View.displayContestInformation = function() {
        var contest = Spotboard.contest;
        $("head > title , #contest-title").text(
            contest.getContestTitle()
        );
        $("#system-information").text(
            contest.getSystemName() + " " + contest.getSystemVersion()
        );

        if (Spotboard.__version__) {
          var version = "v" + Spotboard.__version__;
          if (Spotboard.config.environment === 'develop')
              version += "-devel";
          $("#spotboard-version").text(version);
        }
    };

    /**
     * System Message notification
     */
    Spotboard.View.displaySystemMessage = function(msg, color) {
        if(!msg) return;
        if(!color) color = 'black';
        $("#loading-message").text(msg).css('color', color);
    };

    /**
     * color, balloon, counter 관련한 CSS를 동적으로 추가함
     */
    Spotboard.View.initStyles = function() {
        var contest = Spotboard.contest;

        var problems = contest.getProblems();
        var hsv_from = [-2/360, 0.96, 0.31];
        var hsv_to = [105/360, 0.96, 0.31];
        var $style= $('<style type="text/css" id="problem-balloon-style"></style>');
        for (var i = 0; i <= problems.length;i++)
        {
            var ratio = i / problems.length;
            var h = hsv_from[0] * (1 - ratio) + hsv_to[0] * ratio;
            var s = hsv_from[1] * (1 - ratio) + hsv_to[1] * ratio;
            var v = hsv_from[2] * (1 - ratio) + hsv_to[2] * ratio;
            if (i % 2 == 1) {
                s = Math.max(s - 0.15, 0);
                v = Math.min(v + 0.1, 1);
            }

            $style.append(
'.solved-' + i + ' .solved-count { background-color: ' + Spotboard.Util.hsv2rgb(h, s, v) + '; }\n'
            );
        }

        for (var i = 0; i < problems.length;i++)
        {
            var problem = problems[i];
            if(!problem) continue;
            var pid = problem.getId();
            var probColor = problem.getColor();
            $style.append(
'.problem-result.problem-' + pid + ' b:before { content: "' + problems[i].getName().replace(/[\\"<>\n\r\f]/g, ' ') + '"; }\n'
            );
            if(probColor) $style.append(
'.balloon.problem-' + pid + ' { background-image: url(assets/balloons/' + probColor + '.png); }\n'
            );

            // balloon 이미지를 prefetch (DOM 그린 후 요청하면 풍선이 너무 늦게 뜸)
            new Image().src = 'assets/balloons/' + probColor + '.png';
        }

        $('head').append($style);
    };


    // team list template (handlebars) from index.html
    Spotboard.JST['teamlist'] = (function() {
        var html = $('#team-handlebar-template').html().trim();
        if(!html) throw new Error('team-handlebar-template is missing');
        return Handlebars.compile(html);
    })();

    /**
     * Scoreboard 를 처음부터 그린다.
     */
    Spotboard.View.drawScoreboard = function() {
        var contest = Spotboard.contest,
            problems = contest.getProblems(),
            ranked_teamstats = contest.getRankedTeamStatusList();

        if(Spotboard.config['show_team_group'])
            $("#wrapper").addClass('show-group');
        if(Spotboard.config['animation'] == false)
            $("#wrapper").addClass('no-animation');

        var $teamlist = $("#team-list").empty();

        /**
         * Scoreboard를 그리기 위해 필요한 내부 메소드로,
         * 하나의 team을 나타내는 div element (jQuery Wrapper object)를 새로 만들어 반환한다.
         *
         * @see Spotboard.JST['teamlist'] handlebar 템플릿 (index.html)
         */
        var createTeamElement = function(team) {

            var $item = $(Spotboard.JST['teamlist']({
                id : team.getId(),
                solved : 0,
                rank : 1,
                suffix : "st",    // 어차피 나중에 update 할 것임. 그전까지만 1st
                name : team.getName(),
                group : team.getGroup(),
                penalty : 0,
                problems: problems
            }) );
            $item.data('team-id', team.getId());

            return $item;
        };

        for(var idx in ranked_teamstats)
        {
            var team = ranked_teamstats[idx].getTeam();
            $teamlist.append(createTeamElement(team));
        }

        Spotboard.View.refreshScoreboard();
        $(Spotboard).trigger('drew');
    };

    /**
     * Scoreboard 를 애니메이션 없이 전체 갱신한다.
     */
    Spotboard.View.refreshScoreboard = function() {
        var contest = Spotboard.contest,
            problems = contest.getProblems(),
            ranked_teamstats = contest.getRankedTeamStatusList();
        var $teamlist = $('#team-list');
        var teamsInOrder = [];

        for(var idx in ranked_teamstats)
        {
            var team = ranked_teamstats[idx].getTeam();
            var $team = $teamlist.find('#team-' + team.getId());
            if(!$team.length) continue;

            // 실제 rank 순서대로 DOM을 처리하기 위해 detach한 뒤 $teamlist에 append
            $team.detach();
            Spotboard.View.updateTeamStatus($team);
            teamsInOrder.push($team);
        }
        for(var i in teamsInOrder)
            $teamlist.append(teamsInOrder[i]);

        Spotboard.View.updateVisibility();
        $(Spotboard).trigger('teamPositionUpdated');
    };

    // Search the current public snapshot by team name or affiliation.
    Spotboard.View.updateVisibility = function() {
        var query = Spotboard.View.search_filter.toLocaleLowerCase();
        var first = true;
        $('#team-list > .team').removeClass('visible-first').each(function() {
            var $team = $(this);
            var team = Spotboard.contest.getTeam($team.data('team-id'));
            var matches = (team.getName() + ' ' + team.getGroup(true)).toLocaleLowerCase().indexOf(query) !== -1;
            $team.toggleClass('hidden', !matches);
            if (matches && first) { $team.addClass('visible-first'); first = false; }
        });
        Spotboard.View.updateSolvedCountVisibility();
    };

    /**
     * 팀 등수 업데이트
     */
    Spotboard.View.updateTeamRank = function($team, rank) {
        $team.find(".team-rank")
            .text(rank)
            .removeClass( function(index, css) {
                return css.match(/suffix-.*/).join(' ');
            })
            .addClass( 'suffix-' + Spotboard.Util.ordinalSuffix(rank) );
        return $team;
    };

    /**
     * 하나의 team element에 대한 상태를 업데이트한다.
     */
    Spotboard.View.updateTeamStatus = function($team) {
        if($team == null || !$team.length) return;
        var contest = Spotboard.contest,
            problems = contest.getProblems(),
            teamId = $team.data('team-id'),
            teamStatus = contest.getTeamStatus(teamId);

        // 문제푼 갯수
        var solved = teamStatus.getTotalSolved();
        $team.removeClass( function(index, css) { return css.match(/solved-\d*/).join(' '); } )
            .addClass('solved-' + solved);        // TODO improve with css

        $team.find('.solved-count').text(solved);

        // 페널티
        var penalty = teamStatus.getPenalty();
        $team.find(".team-penalty").text( penalty );

        // 등수
        var rank = teamStatus.getRank();
        Spotboard.View.updateTeamRank($team, rank);

        // 각 문제별 상태 업데이트
        var problemsNewlySolved = [];
        $team.find(".problem-result").each( function(index) {
            // TODO index를 attr로 선택하도록
            var problem = problems[index];
            var problemStat = teamStatus.getProblemStatus(problem);

            $(this).removeClass('solved failed pending');
            if(problemStat.isAccepted()) {
                // solved the problem, add balloon
                $(this).addClass('solved');
                if($team.find('.balloon.problem-' + index).length == 0)
                    problemsNewlySolved.push(problemStat);

                // tool text for the run
                // NOTE: if first solved, additional suffix follows. (see .solved-first:after CSS)
                var penalty_string = 'Solved at ' + problemStat.getSolvedTime() + ' min.';
                $(this).attr('data-balloon', penalty_string);
                $(this).attr('data-balloon-pos', 'down');

                // detect if first solved
                if(Spotboard.config['show_first_solve']) {
                    var problemSummary = contest.getProblemSummary(problem);

                    if(problemSummary.isFirstSolved(problemStat)) {
                        $(this).addClass('solved-first')
                        var solvedFirstTime = problemStat.getSolvedTime();

                        // invalidate all other previous first-solved runs
                        // TODO how to do it elegantly without accessing via jQuery?
                        // TODO check performance as well, worst case complexity is O(N^2)
                        $('.problem-result' + '.solved-first' + '.problem-' + index).each(function() {
                            var teamIdOther = $(this).attr('data-team-id');
                            var problemStatOther = contest.getTeamStatus(teamIdOther).getProblemStatus(problem);
                            // TODO remove this business logic into somewhere proper (e.g. contest.coffee)
                            if(problemStatOther.getSolvedTime() != solvedFirstTime)
                                $(this).removeClass('solved-first');
                        });
                    }
                }
            }
            else {
                if(problemStat.isPending())
                    $(this).addClass('pending');
                else if(problemStat.isFailed())
                    $(this).addClass('failed');
            }

            var sign = problemStat.isAccepted() ? "+" : "-";
            if(problemStat.getFailedAttempts() > 0) {
                $(this).find('.problem-result-text')
                  .text(sign + problemStat.getFailedAttempts());
            }
        });

        problemsNewlySolved.sort(function(p, q) {
            return p.getSolvedRun().getId() - q.getSolvedRun().getId();
        } );

        $.each(problemsNewlySolved, function(idx, problemStat) {
            if (Spotboard.config['show_balloons'])
                Spotboard.View.addBalloon($team, problemStat);
        } );

    };

    Spotboard.View.addBalloon = function($team, problemStat) {
        var $balloonHolder = $team.find('.balloons');
        var problem = problemStat.getProblem();
        $('<span></span>')
            .addClass('balloon')
            .addClass('problem-' + problem.getId())
            .attr('data-balloon', problem.toString())
            .attr('data-balloon-pos', 'down')
            .appendTo($balloonHolder);
    };


    Spotboard.View.updateSolvedCountVisibility = function() {
        var contest = Spotboard.contest,
            problems = contest.getProblems();
        var $teamlist = $('#team-list');

        $('.solved-count').removeClass('first last');
        for(var i = 0; i <= problems.length; ++ i) {
            var group = $teamlist.find('.team:not(.hidden).solved-' + i);
            if(!group.length) continue;
            group.first().find('.solved-count').text('' + i).addClass('first');
            group.last().find('.solved-count').addClass('last');
        }
    };

    Spotboard.View.setSearchFilter = function(filter_text) {
        Spotboard.View.search_filter = filter_text;
        Spotboard.View.updateVisibility();
    };

    return Spotboard.View;

});
