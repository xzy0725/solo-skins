/*
 * Solo - A beautiful, simple, stable, fast Java blogging system.
 * Copyright (c) 2010-2018, b3log.org & hacpai.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * @fileoverview ease js.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 1.2.0.0, Jun 4, 2018
 */
var goTranslate = function () {
    window.open("http://translate.google.com/translate?sl=auto&tl=auto&u=" + location.href);  
};

var getNextPage = function () {
    var $more = $(".article-next");
    currentPage += 1;
    var path = "/articles/";
    if($("#tag").length === 1) {
        var pathnames = location.pathname.split("/");
        path = "/articles/tags/" + pathnames[pathnames.length - 1] + "/";
    } else if ($("#archive").length === 1) {
        var pathnames = location.pathname.split("/");
        path = "/articles/archives/" + pathnames[pathnames.length - 2] + "/" + pathnames[pathnames.length - 1] + "/";
    } else if ($("#author").length === 1) {
        var pathnames = location.pathname.split("/");
        path = "/articles/authors/" + pathnames[pathnames.length - 1] + "/";
    }
    
    $.ajax({
        url: latkeConfig.servePath + path + currentPage,
        type: "GET",
        beforeSend: function () {
            $more.css("background",
                "url(" + latkeConfig.staticServePath + "/skins/ease/images/ajax-loader.gif) no-repeat scroll center center #fefefe");
        },
        success: function(result, textStatus){
            if (!result.sc) {
                return;
            }
            
            var articlesHTML = "",
            pagination = result.rslts.pagination;
            
            // append articles
            for (var i = 0; i < result.rslts.articles.length; i++) {
                var article = result.rslts.articles[i],
                lastClass = "";
                if (result.rslts.articles.length - 1 === i) {
                    lastClass = " article-last";
                }
                
                articlesHTML += '<li class="article' + lastClass + '">' + 
                '<div class="article-title">' +
                '<h2>' +
                '<a rel="bookmark" class="ft-gray" href="' + latkeConfig.servePath + article.articlePermalink + '">' +
                article.articleTitle + 
                '</a>';
                if (article.hasUpdated) {
                    articlesHTML += '<sup>' + Label.updatedLabel + '</sup>';
                }
            
                if (article.articlePutTop) {
                    articlesHTML += '<sup>' + Label.topArticleLabel + '</sup>';
                }
            
                articlesHTML += '</h2>' +
                '<div class="right">' +
                '<a rel="nofollow" class="ft-gray" href="' + latkeConfig.servePath + article.articlePermalink + '#comments">' +
                + article.articleCommentCount + '&nbsp;&nbsp;' + Label.commentLabel +
                '</a>&nbsp;&nbsp;' +
                '<a rel="nofollow" class="ft-gray" href="' + latkeConfig.servePath + article.articlePermalink + '">' +
                article.articleViewCount + '&nbsp;&nbsp;' + Label.viewLabel +
                '</a>' +
                '</div>' +
                '<div class="clear"></div>' +
                '</div>' +
                '<div class="article-body">' +
                '<div id="abstract' + article.oId + '">' +
                article.articleAbstract + 
                '</div>' +
                '<div id="content' + article.oId + '" class="none"></div>' +
                '</div>' +
                '<div class="right ft-gray">';
                if (article.hasUpdated) {
                    articlesHTML += Util.toDate(article.articleUpdateTime, 'yy-MM-dd HH:mm');
                } else {
                    articlesHTML +=  Util.toDate(article.articleCreateTime, 'yy-MM-dd HH:mm');
                }
            
                articlesHTML += ' <a href="' + latkeConfig.servePath + '/authors/' + article.authorId + '">' + article.authorName + '</a>' +
                '</div>' +
                '<div class="left ft-gray">' +
                Label.tag1Label + " ";
        
                var articleTags = article.articleTags.split(",");
                for (var j = 0; j < articleTags.length; j++) {
                    articlesHTML +=  '<a rel="tag" href="' + latkeConfig.servePath + '/tags/' + encodeURIComponent(articleTags[j])  + '">' +
                    articleTags[j] + '</a>';
            
                    if (j < articleTags.length - 1) {
                        articlesHTML += ", ";
                    }
                }
                
                articlesHTML += '</div>' +
            '<div class="clear"></div>' +
            '</li>';
            }
            
            $(".article-last").removeClass("article-last");
            $(".main>.wrapper>ul").append(articlesHTML);
            
            // 最后一页处理
            if (pagination.paginationPageCount === currentPage) {
                $more.remove();
            } else {
                $more.css("background", "none");  
            }
        }
    });
};

var ease = {
    $header: $(".header"),
    headerH: 103,
    $body: $(".main > .wrapper"),
    $nav: $(".nav"),
    getCurrentPage: function () {
        var $next = $(".article-next");
        if ($next.length > 0) {
            window.currentPage = $next.data("page");
        }
    },
    
    setNavCurrent: function () {
        $(".nav ul a").each(function () {
            var $this = $(this);
            if ($this.attr("href") === location.href) {
                $this.addClass("current");
            } else if (/\/[0-9]+$/.test(location.pathname)) {
                $(".nav ul li")[0].className = "current";
            }
        });
    },
    
    initCommon: function () {
        Util.init();
        Util.replaceSideEm($(".recent-comments-content"));
        Util.buildTags("tagsSide");
    },
    
    initArchives: function () {
        var $archives = $(".archives");
        if ($archives.length < 1) {
            return;
        }
        
        $(".footer").css("marginTop", "30px");
        var years = [],
        $archiveList = $archives.find("span").each(function () {
            var year = $(this).data("year"),
            tag = true;
            for (var i = 0; i < years.length; i++) {
                if (year === years[i]) {
                    tag = false;
                    break;
                }
            }
            if (tag) {
                years.push(year);
            }
        });
        
        var yearsHTML = "";
        for (var j = 0; j < years.length; j++) {
            var monthsHTML = "";
            for (var l = 0; l < $archiveList.length; l++) {
                var $month = $($archiveList[l]);
                if ($month.data("year") === years[j]) {
                    monthsHTML += $month.html();
                }
            }
            
            yearsHTML += "<div><h3 class='ft-gray'>" + years[j] + "</h3>" + monthsHTML + "</div>";
        }
        
        $archives.html(yearsHTML);
        
        // position
        var $items = $(".archives>div"),
        line = 0,
        top = 0,
        heights = [];
       
        for (var m = 0; m < $items.length; m++) {
            for (var n = 0; n < 3; n++) {
                if (m >= $items.length) {
                    break;
                }
                
                $items[m].style.left = (n * 310) + "px";
                
                if (line > 0) {
                    if ($items[m - 3].style.top !== "") {
                        top = parseInt($items[m - 3].style.top);
                    }
                    $items[m].style.top = $($items[m - 3]).height() + 60 + top + "px";
                    
                    heights[n] = parseInt($items[m].style.top) + $($items[m]).height() + 60;
                } else {
                    heights[n] = $($items[m]).height() + 60;
                }
                
                if (n < 2) {
                    m += 1;
                }
            }
            line += 1;
        }
        
        // archive height
        $archives.height(heights.sort()[heights.length - 1]);
    },
    
    scrollEvent: function () {
        var _it = this;
        $(window).scroll(function () {
            var y = $(window).scrollTop();
            
            // go top icon show or hide
            if (y > _it.headerH) {
                var bodyH = $(window).height();
                var top =  y + bodyH - 21;
                if ($("body").height() - 58 <= y + bodyH) {
                    top = $(".footer").offset().top - 21; 
                }
                $("#goTop").fadeIn("slow").css("top", top);
            } else {
                $("#goTop").hide();
            }
        });
    },
    
    setDynamic: function () {
        var $dynamic = $(".dynamic");
        if ($(".dynamic").length < 1) {
            return;
        }
        
        var $categories = $dynamic.find(".side-categories"),
        $tags = $dynamic.find(".side-tags"),
        $mostComment = $dynamic.find(".side-most-comment"),
        $mostView = $dynamic.find(".side-most-view");
        
        if ($categories.height() > $tags.height()) {
            $tags.height($categories.height());
        } else {
            $categories.height($tags.height());
        }
        
        if ($mostComment.height() > $mostView.height()) {
            $mostView.height($mostComment.height());
        } else {
            $mostComment.height($mostView.height());
        }
        
        // emotions
        $(".article-body").each(function () {
            this.innerHTML = Util.replaceEmString($(this).html());
        });
    }
};
    
(function () {
    ease.getCurrentPage();
    ease.initCommon();
    ease.scrollEvent();
    ease.setNavCurrent();
    
    ease.initArchives();
    ease.setDynamic();
})();