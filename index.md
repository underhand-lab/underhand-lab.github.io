---
layout: default
navigation:
  - name: "소개"
    link: "#about"
  - name: "작업물"
    link: "#portfolio"
  - name: "활동"
    link: "#activities"
  - name: "연락"
    link: "#contact"
---

<!-- 로딩 화면 및 스크롤 진행바 >
<div class="loader">
  <div class="loader-content">Loading...</div>
</div>
<div class="scroll-progress"></div>

<히어로 섹션>
<section id="home" class="hero section">
  <div class="hero-content">
    <h1 class="hero-title">게임 개발자 이지헌입니다.</h1>
    <p class="hero-subtitle">게임 개발자 & 게임 디자이너</p>
  </div>
</section-->

<!-- 자기소개 섹션 -->
<section id="about" class="section">
  <div class="container">
    {% include about.html %}
  </div>
</section>

<!-- 프로젝트 섹션 (데이터 기반 자동 생성) -->
{% assign main_tags = site.data.portfolio | map: "tag" %}

{% for category in site.data.portfolio %}
<section id="portfolio" class="section portfolio-grid">
  <div class="container">
    <h2 class="section-title">{{ category.title }}</h2>
    {% include works.html tag=category.tag %}
  </div>
</section>
{% endfor %}

<!-- 기타 작업물 섹션 (위에서 정의된 태그들을 제외한 나머지) -->
<section class="section portfolio-grid">
  <div class="container">
    <h2 class="section-title">기타 작업물</h2>
    {% include works.html exclude_tags=main_tags %}
  </div>
</section>

<section id="activities" class="section">
  <div class="container">
    {% for section in site.data.activities %}
    <div class="activity-group">
      <h2 class="section-title">{{ section.title }}</h2>
      {% include activity_list.html items=section.items %}
    </div>
    {% endfor %}
  </div>
</section>

{% include contact.html %}

<!--script src="script.js"></script-->