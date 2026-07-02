<%@ page contentType="text/css;charset=UTF-8" defaultCodec="none" %>
body
, .backgroundcolor--pale-sky
, .navbar-light.bg-light .navbar-nav a
, .nav-tabs > li.active > a
, .nav-tabs > li.active > a:hover
, .nav-tabs > li.active > a:focus
, .side-menu
, accordion > div.panel-group > div.panel > div.panel-collapse > div.panel-body
, .nav > li > a:focus
, .nav > li > a:hover
, .btn-outline-secondary
, .btn-outline-secondary:hover
, .dropdown-toggle
, .banner::before
, .banner .banner-container .bg-item
{
  background-color: ${mainBackgroundColour};
}
.banner .banner-container .banner-gradient
{
  background-image: -webkit-linear-gradient(left, ${mainBackgroundColour}, ${mainBackgroundColour} 33.333333%, rgba(0,0,0,0) 100%);
  background-image: linear-gradient(to right, ${mainBackgroundColour}, ${mainBackgroundColour} 33.333333%, rgba(0,0,0,0) 100%);
}
.color--pale-sky
{
  color: ${mainBackgroundColour};
}

/* Main Text colour */
body
, p
, li
, ul
, .color-madison
, .heading-large
{
    color: ${mainTextColour};
}
.background-madison {
  background-color: ${mainTextColour};
}

/* Call To Action colour */
.background-lochmara
, .jumbotron
, .btn-primary
, .pagination > .active > a
, .pagination > .active > a:hover
, .pagination > .active > a:focus
, .pagination > .active > span
, .pagination > .active > span:hover
, .pagination > .active > span:focus
{
  background-color: ${callToActionColour};
}

h4
, a
, .color-lochmara
, .breadcrumb > .active
, .btn-mini
, .embedded-sandbox .btn
, .embedded-sandbox h1
, footer p.lead
, .navbar-light.bg-light .navbar-brand
, .pagination > li > a
, .pagination > li > span
, .profile-contributor-text
, .soc-envelope:hover .fa
{
  color: ${callToActionColour};
}

.btn-outline-secondary
, .btn-mini
, .btn-primary
, .dropdown-toggle
, .embedded-sandbox .btn
, .heading-underlined
, .main-stats__stat
, .main-stats > div:last-child
, .main-stats .main-stats__stat
, .nav-tabs > li.active > a
, .nav-tabs > li.active > a:hover
, .nav-tabs > li.active > a:focus
, .pagination > li > a
, .pagination > li > span
, .pagination > .active > a
, .pagination > .active > a:hover
, .pagination > .active > a:focus
, .pagination > .active > span
, .pagination > .active > span:hover
, .pagination > .active > span:focus
, .pagination > .disabled > a
, .pagination > .disabled > a:hover
, .pagination > .disabled > a:focus
, .pagination > .disabled > span
, .pagination > .disabled > span:hover
, .pagination > .disabled > span:focus
, #resourceList input[type=text]
{
  border-color: ${callToActionColour};
}

#primary-nav.navbar
, .nav-tabs
{
  border-bottom-color: ${callToActionColour};
}

.main-footer-border
, .main-footer
{
  border-top-color: ${callToActionColour};
}

/* Call To Action Hover colour */
.background-venice-blue
, .btn-primary:hover
, .btn-primary:focus
, .btn-primary:active
, .open > .dropdown-toggle.btn-primary
{
  background-color: ${callToActionHoverColour};
}

.btn-outline-secondary:hover
, .btn-primary:hover
, .btn-primary.focus
, .btn-primary.active
, .pagination > li > a:focus
, .pagination > li > a:hover
, .pagination > li > span:hover
, .pagination > li > span:focus
, .nav-tabs > li > a:hover
, .open > .dropdown-toggle.btn-primary
{
  border-color: ${callToActionHoverColour};
}

.color-venice-blue
, a:hover
, a:focus
, .btn-outline-secondary:hover
, .navbar-light.bg-light .navbar-nav > .active > a
, .navbar-light.bg-light .navbar-nav > li > a:hover
, .navbar-light.bg-light .navbar-brand:hover
, .nav-tabs > li.active > a
, .pagination > li > a:hover
, .pagination > li > a:focus
, .pagination > li > span:hover
, .pagination > li > span:focus
{
  color: ${callToActionHoverColour};
}

/* Header text colour */
input.form-control:focus + ul.dropdown-menu + .btn-outline-secondary
, input.form-control:focus + .btn-outline-secondary
, .header-control .dropdown-toggle
, .header-control .dropdown-toggle:hover
, .header-control input
, .header-control input:focus
{
  border-color: ${headerTextColour};
}
.btn-outline-secondary
, .dropdown-toggle
, .navbar-light.bg-light .navbar-nav a
, .navbar-light.bg-light .navbar-nav > li > a
{
  color: ${headerTextColour};
}

/* Footer Background colour */

footer {
  background-color: ${footerBackgroundColour};
}

/* Footer Text colour */
footer
, .main-footer a
, .main-footer a:hover
, .main-footer a:focus
, .main-footer a > i
{
  color: ${footerTextColour};
}

/* Media queries */
@media (min-width: 768px) {
.banner .banner-container .banner-gradient
  {
    background-image: -webkit-linear-gradient(left, ${mainBackgroundColour}, ${mainBackgroundColour} 25%, rgba(0,0,0,0) 100%);
    background-image: linear-gradient(to right, ${mainBackgroundColour}, ${mainBackgroundColour} 25%, rgba(0,0,0,0) 100%);
  }
}

@media (min-width: 992px) {
  .banner .banner-container .banner-gradient
  {
    background-image: -webkit-linear-gradient(left, ${mainBackgroundColour}, ${mainBackgroundColour} 20%, rgba(0,0,0,0) 100%);
    background-image: linear-gradient(to right, ${mainBackgroundColour}, ${mainBackgroundColour} 20%, rgba(0,0,0,0) 100%);
  }
  .border-left{
    border-left-color: ${footerTextColour};
  }
}

@media (min-width: 1200px) {
  .banner .banner-container .banner-gradient
  {
    background-image: -webkit-linear-gradient(left, ${mainBackgroundColour}, ${mainBackgroundColour} 15%, rgba(0,0,0,0) 100%);
    background-image: linear-gradient(to right, ${mainBackgroundColour}, ${mainBackgroundColour} 15%, rgba(0,0,0,0) 100%);
  }
}