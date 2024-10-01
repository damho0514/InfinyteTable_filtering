# AITRICS Frontend assignment

## 과제 안내

https://aitrics.notion.site/Frontend-latest-74bac2856f5e459da0ac1fce942d38a3?pvs=4

## 과제 설명

- tanstack/react-query, react-table를 이용해 기본 테이블을 테일윈드를 적용시켰습니다.
- tanstakck을 선택한 가장 큰 이유는 react-table과 무한 스크롤 관련해서 지원할 수 있어 라이브러리를 사용했습니다.
- 테이블 관련 컴포넌트 분리는 3가지로 나뉩니다. 헤더,로우, 테이블(비즈니스 로직)
- axios를 사용해 json-server를 연동합니다.

###  테이블 구현체
  - 테이블은 react-table를 사용했으며, table에 데이터에 대한 값이 무거워 columns와, data rowf를 위해 rowModel이라는 값으로 useMemo를 사용해 메모이제이션을 수행하여 데이터를 최적화하였습니다.
  -  
  
### 필터링 구현
- 다중 필터가 json-server에서 미들웨어를 사용하지 않으면 다중 필터가 어려운 관계로 클라이언트에서 필터링을 구현하였습니다.
  

### 정렬 구현
- 리액트 테이블에서 onSortingHandle api를 제공해, sorting되는 핸들러를 만들고, 비즈니스 요구사항에 맞게 기본 정렬은 screeningDate 내림차순과 그 외 정렬은 오름차순,내림차순,기본정렬 세가지에 대한 정렬을 구현하였습니다.

- 무한 스크롤
- 인터셉터 옵저버와, 인피니티 쿼리를 사용하여 구현하였으며, useInfiniteQuery 훅에 옵션을 사용하며, 테이블에 최하단까지 스크롤 시 다음 페이지가 나오도록 구현하였습니다.
<!-- 이곳에 과제 설명을 
작성해주세요 ! -->
