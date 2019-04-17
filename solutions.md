---
layout: home
title: Solutions
permalink: /solutions/
active: Soutions
---

SCCC에서 해결한 문제들을 모아놓은 곳입니다. [jekyllrb.com](https://jekyllrb.com/)

You can find the source code for Jekyll at GitHub:
[jekyll][jekyll-organization] /
[jekyll](https://github.com/jekyll/jekyll)

[jekyll-organization]: https://github.com/jekyll


{% for solution in site.solutions %}
  <article class="index-page solution">
    <h2><a href="{{ solution.url }}">{{ solution.title }}</a></h2>
    {% if solution.lastmod %}
      <span class="date">{{ solution.lastmod | date: "%d-%m-%Y"  }}</span>
    {% else %}
      <span class="date">{{ solution.date | date: "%d-%m-%Y"  }}</span>
    {% endif %}
  </article>
{% endfor %}

