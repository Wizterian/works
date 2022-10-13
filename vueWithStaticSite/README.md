# README

## 静的サイト + Vue SPA
（ページに別途jsとcssが紐づく）静的Webサイトの構造を維持したいという要件を叶えつつ、問題であったCMSテンプレートコストを減らすため一部をVue RouterでSPA化（ヘッドレスCMSにする）  
  
Top（ページにjsとcssが紐づく静的サイト構造）  
  ├ top.js  
  └ top.css  
  
Stage（ヘッドレスCMS化）  
  └ stage.vue 
    ├ stage.js（単一ファイルでも分離でもOK）  
    └ stage.css（単一ファイルでも分離でもOK）   
  
NewsIndex（SPA・ヘッドレスCMS化）
  └ NewsDetail.js（単一ファイル）  

## Vue
v3.2以上

## Vue Router
v4.0以上

## node  
v16.16.0  

## npm  
8.11.0  