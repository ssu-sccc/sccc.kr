---
layout: solution
title: Solutions
permalink: /solutions/
active: Soutions
---

SCCC에서 해결한 문제들의 솔루션을 모읍니다. 회원 누구나 pull-request를 날려서 추가할 수 있습니다.

{% for solution in site.solutions %}
  <article class="index-page solution">
    <h2><a href="{{ site.baseurl | append: solution.url }}">{{ solution.title }}</a></h2>
    {% if solution.lastmod %}
      <span class="date">{{ solution.lastmod | date: "%d-%m-%Y"  }}</span>
    {% else %}
      <span class="date">{{ solution.date | date: "%d-%m-%Y"  }}</span>
    {% endif %}
    {% if solution.author %}
      <div class="author-wrapper">
        <span class="author">written by @{{ solution.author }}</span>
      </div>
    {% endif %}
  </article>
{% endfor %}
