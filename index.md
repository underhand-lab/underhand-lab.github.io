---
layout: default
navigation:
  - name: "소개"
    link: "#about"
  - name: "CV-Val"
    link: "#about-cv"
  - name: "Sit-Val"
    link: "#about-sit"
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

<section id="about-cv" class="section">
  <div class="container">
    {% include about.html title="CV-Val" image_pos="right" %}
  </div>
</section>


<section id="about-sit" class="section">
  <div class="container">
    {% include about.html title="Sit-Val" %}
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

<!--
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

script src="script.js"></script-->
{% include contact.html %}