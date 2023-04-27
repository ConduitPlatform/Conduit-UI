# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.15.14](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.13...v0.15.14) (2023-04-27)


### Bug Fixes

* emailSlice ([970a9de](https://github.com/ConduitPlatform/Conduit-UI/commit/970a9de0717894e3b5492175389994abc8afeae9))

### [0.15.13](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.12...v0.15.13) (2023-04-26)


### Features

* **email:** add secure/ignoreTls settings ([63fc1f0](https://github.com/ConduitPlatform/Conduit-UI/commit/63fc1f000104ea0c5b290eb9bfee18a80701b463))

### [0.15.12](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.11...v0.15.12) (2023-02-14)


### Features

* **push-notifications:** basic provider support ([#219](https://github.com/ConduitPlatform/Conduit-UI/issues/219)) ([cbb7163](https://github.com/ConduitPlatform/Conduit-UI/commit/cbb71632fee6130c886fa64ec08e2e6c4239b4f1))


### Bug Fixes

* **database:** schema editor _id, createdAt, updatedAt field constraints ([#220](https://github.com/ConduitPlatform/Conduit-UI/issues/220)) ([77730fe](https://github.com/ConduitPlatform/Conduit-UI/commit/77730fed6e26b3c255dee6af5717dbaf1c57b023))
* **settings:** admin allowed to try to delete self ([#221](https://github.com/ConduitPlatform/Conduit-UI/issues/221)) ([2667f80](https://github.com/ConduitPlatform/Conduit-UI/commit/2667f8042a6e7bc594fe3eb847bd07b1f018c488))

### [0.15.11](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.10...v0.15.11) (2023-02-02)


### Bug Fixes

* **database:** unable to set postgres indexes, invalid hash index value ([#217](https://github.com/ConduitPlatform/Conduit-UI/issues/217)) ([86a21ab](https://github.com/ConduitPlatform/Conduit-UI/commit/86a21abb861b41e5b9723d5700c28ec57ab71938))

### [0.15.10](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.9...v0.15.10) (2023-01-31)


### Features

* **storage:** make S3 storage generic with endpoint specification ([#216](https://github.com/ConduitPlatform/Conduit-UI/issues/216)) ([da5b2bf](https://github.com/ConduitPlatform/Conduit-UI/commit/da5b2bfdaddf02d1b1ed8765c6b8064d001965f6))

### [0.15.9](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.8...v0.15.9) (2023-01-20)


### Bug Fixes

* **authentication:** missing client sessions config (hotfix) ([b5875ea](https://github.com/ConduitPlatform/Conduit-UI/commit/b5875ea16da44136d634f5562bf1cddee18a0fc8))

### [0.15.8](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.7...v0.15.8) (2023-01-20)


### Features

* **metrics:** label injection on prometheus metrics to add namespace when it exists ([#215](https://github.com/ConduitPlatform/Conduit-UI/issues/215)) ([52ad5bb](https://github.com/ConduitPlatform/Conduit-UI/commit/52ad5bb2df6df74ea10f516d665995999047c5a2))


### Bug Fixes

* **metrics:** label injection ([a2c7e04](https://github.com/ConduitPlatform/Conduit-UI/commit/a2c7e046e3f5633a0393c895911d4ec38bf6ec66))

### [0.15.7](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.6...v0.15.7) (2023-01-13)


### Features

* captcha in authentication config ([#210](https://github.com/ConduitPlatform/Conduit-UI/issues/210)) ([29de7e0](https://github.com/ConduitPlatform/Conduit-UI/commit/29de7e0b253870f30222fbf4f58f3237d169253f))
* **SchemaEditor:** defaut values such as _id, creaated, update now are prefilled ([#208](https://github.com/ConduitPlatform/Conduit-UI/issues/208)) ([584dd24](https://github.com/ConduitPlatform/Conduit-UI/commit/584dd2403510ffe3e121bbd688e7c335863aa7b2))


### Bug Fixes

* **database:** broken relation doc links in document selection ([#206](https://github.com/ConduitPlatform/Conduit-UI/issues/206)) ([29269a8](https://github.com/ConduitPlatform/Conduit-UI/commit/29269a8a2c123bf6c34d3f9433be70adb2a4fe0d))
* **database:** custom endpoint lt,le,gt,ge field comparison operators not selectable for date fields ([#213](https://github.com/ConduitPlatform/Conduit-UI/issues/213)) ([0fe77b2](https://github.com/ConduitPlatform/Conduit-UI/commit/0fe77b2288a21fe88cae9941cd7a665f88a758b4))
* Storage fix navigation ([#214](https://github.com/ConduitPlatform/Conduit-UI/issues/214)) ([3afa127](https://github.com/ConduitPlatform/Conduit-UI/commit/3afa127118c1ccf2a7e3f05274554a2db539e4d4))

### [0.15.6](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.5...v0.15.6) (2022-12-16)


### Features

* **push-notifications:** oneSignal support ([#199](https://github.com/ConduitPlatform/Conduit-UI/issues/199)) ([ba235ef](https://github.com/ConduitPlatform/Conduit-UI/commit/ba235efa8f5ab5dc24b38a61c76c402dae1205c6))
* use Inter font ([#205](https://github.com/ConduitPlatform/Conduit-UI/issues/205)) ([59397c3](https://github.com/ConduitPlatform/Conduit-UI/commit/59397c3c8af316cb1dbaed2b61cfb33e4ce082a9))


### Bug Fixes

* global fixes ([#200](https://github.com/ConduitPlatform/Conduit-UI/issues/200)) ([b21250c](https://github.com/ConduitPlatform/Conduit-UI/commit/b21250ca00d63d7075b7961b2fb3a61c861f3bb1))
* **metrics:** health status displaying critical on missing data, prometheus job ([#204](https://github.com/ConduitPlatform/Conduit-UI/issues/204)) ([606b266](https://github.com/ConduitPlatform/Conduit-UI/commit/606b266f5e9b1acd49de1649f17b2eb8c820272f)), closes [#466](https://github.com/ConduitPlatform/Conduit-UI/issues/466)

### [0.15.5](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.4...v0.15.5) (2022-11-25)


### Bug Fixes

* **database:** custom-endpoints location enum ([4e23fcc](https://github.com/ConduitPlatform/Conduit-UI/commit/4e23fccb2e1c6788b2fd632c2892ca50345d14a9))
* **SchemaOverview:** now showing compiled fields instead of fields ([#198](https://github.com/ConduitPlatform/Conduit-UI/issues/198)) ([9d1ca84](https://github.com/ConduitPlatform/Conduit-UI/commit/9d1ca84207273cdde774edfb4ba07eae00317054))

### [0.15.4](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.3...v0.15.4) (2022-11-19)


### Bug Fixes

* **custom-endpoints:** Minor Custom Endpoints fixes ([#197](https://github.com/ConduitPlatform/Conduit-UI/issues/197)) ([cc97d8f](https://github.com/ConduitPlatform/Conduit-UI/commit/cc97d8f492183289024edac96e765c9b84cd423d))

### [0.15.3](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.2...v0.15.3) (2022-11-18)


### Features

* **SchemaIndexes:** added indexes editing for schemas ([#195](https://github.com/ConduitPlatform/Conduit-UI/issues/195)) ([40301d5](https://github.com/ConduitPlatform/Conduit-UI/commit/40301d5421e5cd7721707c2a5dab483cd82a23a9))


### Bug Fixes

* **App:** General qol fixes ([#196](https://github.com/ConduitPlatform/Conduit-UI/issues/196)) ([ea1db9b](https://github.com/ConduitPlatform/Conduit-UI/commit/ea1db9bbfba699aa1cc2a677a162ed3e6994ff2b))

### [0.15.2](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.1...v0.15.2) (2022-11-17)


### Bug Fixes

* assignments check that allows to set ObjectId type to Relation ([#192](https://github.com/ConduitPlatform/Conduit-UI/issues/192)) ([12ee6a0](https://github.com/ConduitPlatform/Conduit-UI/commit/12ee6a08483b3c73f74c9fdd1b930f9853036d87))
* change admin password old-new issue ([#188](https://github.com/ConduitPlatform/Conduit-UI/issues/188)) ([6f511f0](https://github.com/ConduitPlatform/Conduit-UI/commit/6f511f0bc3a4cc75f5573af84e1f0acacd8bd787))
* **Custom endpoints:** qol fixes ([#194](https://github.com/ConduitPlatform/Conduit-UI/issues/194)) ([0270aac](https://github.com/ConduitPlatform/Conduit-UI/commit/0270aacc1fb8cac31d17cc4795cf6ae33e3d624b))
* **custom-endpoints:** stability fixes ([#191](https://github.com/ConduitPlatform/Conduit-UI/issues/191)) ([2a8f33c](https://github.com/ConduitPlatform/Conduit-UI/commit/2a8f33c626942ad11e3724cb18638f3ef65c373f))
* **Schemas:** Schema editing improvements ([#190](https://github.com/ConduitPlatform/Conduit-UI/issues/190)) ([28b69e9](https://github.com/ConduitPlatform/Conduit-UI/commit/28b69e952c8f7deb3c5671a8318bdeee45a84848))

### [0.15.1](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.0...v0.15.1) (2022-10-25)


### Features

* **Providers:** addition of Twitter, LinkedIn, Apple, Reddit, BitBucket ([#187](https://github.com/ConduitPlatform/Conduit-UI/issues/187)) ([71f53b6](https://github.com/ConduitPlatform/Conduit-UI/commit/71f53b6817265607a32f5aad15ae1e28375e992a))

## [0.15.0](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.0-rc.1...v0.15.0) (2022-10-21)


### Features

* storage search ([#184](https://github.com/ConduitPlatform/Conduit-UI/issues/184)) ([e9b1b9d](https://github.com/ConduitPlatform/Conduit-UI/commit/e9b1b9d0cfe4b40172f8f37ca07c223afb52006f))


### Bug Fixes

* **Enums:** restructured enum field editing ([#177](https://github.com/ConduitPlatform/Conduit-UI/issues/177)) ([b13923d](https://github.com/ConduitPlatform/Conduit-UI/commit/b13923d8d90ce28cbafaa95a80a7b52a8e20499c))
* issues ([#186](https://github.com/ConduitPlatform/Conduit-UI/issues/186)) ([23cc668](https://github.com/ConduitPlatform/Conduit-UI/commit/23cc668e4c581e5c53977afad906cbb1714a4575))
* Logout issue ([#185](https://github.com/ConduitPlatform/Conduit-UI/issues/185)) ([d53d4a7](https://github.com/ConduitPlatform/Conduit-UI/commit/d53d4a7bbd56b5e0707a5db2b7c686e3ba9ddb9b))
* logs list debounce double requests ([#179](https://github.com/ConduitPlatform/Conduit-UI/issues/179)) ([7f485d4](https://github.com/ConduitPlatform/Conduit-UI/commit/7f485d48d796c2657398a773511af911ffcd60c6))
* logs list scroll to bottom ([#178](https://github.com/ConduitPlatform/Conduit-UI/issues/178)) ([daa07a4](https://github.com/ConduitPlatform/Conduit-UI/commit/daa07a4c523179319f06604ae37312b11a39843f))
* Metrics cards sizes and spacing ([#180](https://github.com/ConduitPlatform/Conduit-UI/issues/180)) ([68fe400](https://github.com/ConduitPlatform/Conduit-UI/commit/68fe400c4b802759d0680290e7d0238bbf6753ae))
* storage fixes ([#181](https://github.com/ConduitPlatform/Conduit-UI/issues/181)) ([ce74e7f](https://github.com/ConduitPlatform/Conduit-UI/commit/ce74e7f199b92c85f5dfb7135cb89b8b69dd50eb))
* Styling changes ([#176](https://github.com/ConduitPlatform/Conduit-UI/issues/176)) ([f94e93f](https://github.com/ConduitPlatform/Conduit-UI/commit/f94e93f8e8fe03e185f16bc70c3c3c25dbf0bac6))
* UI fixes ([#175](https://github.com/ConduitPlatform/Conduit-UI/issues/175)) ([53db312](https://github.com/ConduitPlatform/Conduit-UI/commit/53db312cccbb80b50de96ef568b02398104729cc))

## [0.15.0-rc.1](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.15.0-rc.0...v0.15.0-rc.1) (2022-10-11)


### Bug Fixes

* **App:** minor bug fixes, code improvements ([#173](https://github.com/ConduitPlatform/Conduit-UI/issues/173)) ([c3bf0cd](https://github.com/ConduitPlatform/Conduit-UI/commit/c3bf0cde1df8db0e92685dc1d5e723e59a3026ec))
* logs list expanded messages hide issue ([#171](https://github.com/ConduitPlatform/Conduit-UI/issues/171)) ([7eee0e0](https://github.com/ConduitPlatform/Conduit-UI/commit/7eee0e0b8194360f83eeb73e129f110d867abbb4))
* **Storage, Metrics:** required fields, capitalization ([#174](https://github.com/ConduitPlatform/Conduit-UI/issues/174)) ([5e7e8f4](https://github.com/ConduitPlatform/Conduit-UI/commit/5e7e8f443fec83dc5062af47131608f4bd16077a))

## [0.15.0-rc.0](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.14.1...v0.15.0-rc.0) (2022-10-07)


### ⚠ BREAKING CHANGES

* **Authentication:** config refactor (#156)
* **Tokens:** changed JWT to Bearer token as support was dropped (#123)

### Features

* admin and client routes metrics ([#146](https://github.com/ConduitPlatform/Conduit-UI/issues/146)) ([c0f3b53](https://github.com/ConduitPlatform/Conduit-UI/commit/c0f3b536378bf784dc461c202e013053ddd0388f))
* **admin:** Two factor authentication  ([#143](https://github.com/ConduitPlatform/Conduit-UI/issues/143)) ([3c3c9af](https://github.com/ConduitPlatform/Conduit-UI/commit/3c3c9afc822abb37ba8150c0c5102964f20d7b86))
* **Authentication:** magic link sign in method added ([#159](https://github.com/ConduitPlatform/Conduit-UI/issues/159)) ([fe79398](https://github.com/ConduitPlatform/Conduit-UI/commit/fe7939885cd142555d2c333ff46b8253c0d75dd4))
* Database rework  ([2192a04](https://github.com/ConduitPlatform/Conduit-UI/commit/2192a043082e5e12e0c57190af9b56e1e86b2f6f))
* **Documentation:** documentation tooltips / buttons ([#145](https://github.com/ConduitPlatform/Conduit-UI/issues/145)) ([99f376a](https://github.com/ConduitPlatform/Conduit-UI/commit/99f376a610660127fef1d5784a5e574526f24153))
* Extract metrics to redux ([#141](https://github.com/ConduitPlatform/Conduit-UI/issues/141)) ([2db71dc](https://github.com/ConduitPlatform/Conduit-UI/commit/2db71dc785900f703d7ffd7c42b8865219b93a3b))
* handle offline module navigation, redirect to home ([#157](https://github.com/ConduitPlatform/Conduit-UI/issues/157)) ([e2639d2](https://github.com/ConduitPlatform/Conduit-UI/commit/e2639d2409e3c5ec669a1413542420458036484d))
* lists loading footer ([#135](https://github.com/ConduitPlatform/Conduit-UI/issues/135)) ([38f2551](https://github.com/ConduitPlatform/Conduit-UI/commit/38f25514e4ee3466e13b1d80ad7a9d939ea001dd))
* logs ([75e8634](https://github.com/ConduitPlatform/Conduit-UI/commit/75e8634378872edb29b09ecdbf98f0242a2d741b))
* logs expandable ([#148](https://github.com/ConduitPlatform/Conduit-UI/issues/148)) ([f6ff84a](https://github.com/ConduitPlatform/Conduit-UI/commit/f6ff84a333127cf630966218ab4e9ce60776dbeb))
* logs list live reload button and functionality ([#137](https://github.com/ConduitPlatform/Conduit-UI/issues/137)) ([798664f](https://github.com/ConduitPlatform/Conduit-UI/commit/798664fc3c566ee2eec56bb6273bfa707c7dc55f))
* Logs metrics availability ([#165](https://github.com/ConduitPlatform/Conduit-UI/issues/165)) ([fb296c7](https://github.com/ConduitPlatform/Conduit-UI/commit/fb296c73204c68f0c148ec2c84304833036a8cb1))
* logs open drawer with title press  ([ed95b43](https://github.com/ConduitPlatform/Conduit-UI/commit/ed95b431115c61ce1f48ada844198cb5085cd2a3))
* **Lotties:** added lotties to metric widgets ([#153](https://github.com/ConduitPlatform/Conduit-UI/issues/153)) ([c744562](https://github.com/ConduitPlatform/Conduit-UI/commit/c7445620ec2b9a0ee138679cdadfdd3a130f0057))
* **Lotties:** changed widget icon for endpoint, module health and schemas ([#155](https://github.com/ConduitPlatform/Conduit-UI/issues/155)) ([8f206d5](https://github.com/ConduitPlatform/Conduit-UI/commit/8f206d5e5ab86a29e355ab7aebf697a3cddf5ca0))
* Metrics dashboards ([#126](https://github.com/ConduitPlatform/Conduit-UI/issues/126)) ([d368b0a](https://github.com/ConduitPlatform/Conduit-UI/commit/d368b0a014f0918c16b20cf264e31c49166c124e))
* Metrics styling updates ([#147](https://github.com/ConduitPlatform/Conduit-UI/issues/147)) ([816f2dd](https://github.com/ConduitPlatform/Conduit-UI/commit/816f2dd33e096c97b1f6fcff174402f01e2a2a74))
* modules refresh button ([#139](https://github.com/ConduitPlatform/Conduit-UI/issues/139)) ([f93fc40](https://github.com/ConduitPlatform/Conduit-UI/commit/f93fc405a698810210b265488153d2350c230a36))
* react hook form register ([7fe1e6b](https://github.com/ConduitPlatform/Conduit-UI/commit/7fe1e6bc86121a691fc72382890dcf85dfe5b4dc))
* swipeable logs drawer ([3cf2361](https://github.com/ConduitPlatform/Conduit-UI/commit/3cf2361741b8d8565fc15f16dea163c118d0f11b))
* Theming options ([#129](https://github.com/ConduitPlatform/Conduit-UI/issues/129)) ([1769741](https://github.com/ConduitPlatform/Conduit-UI/commit/17697411399c502717973cba1a0a3fe83acaa8f0))
* UI consistency ([#170](https://github.com/ConduitPlatform/Conduit-UI/issues/170)) ([6756378](https://github.com/ConduitPlatform/Conduit-UI/commit/675637856b3ab7ba64d7b81fa7f96e18bfc353d8))
* Virtuoso list ([#132](https://github.com/ConduitPlatform/Conduit-UI/issues/132)) ([0fc8400](https://github.com/ConduitPlatform/Conduit-UI/commit/0fc8400bac8a9e81d1aa4bf0f0b4313cee937c87))


### Bug Fixes

* 404 errors on disabled modules ([4a36c59](https://github.com/ConduitPlatform/Conduit-UI/commit/4a36c59938a0c043186c9d2223952c9f23e0dadd))
* **Authentication:** config refactor ([#156](https://github.com/ConduitPlatform/Conduit-UI/issues/156)) ([080c9c6](https://github.com/ConduitPlatform/Conduit-UI/commit/080c9c633924e58bc6d81176885c6143c4593e63))
* chat request populate field, chat message user ([#136](https://github.com/ConduitPlatform/Conduit-UI/issues/136)) ([864559c](https://github.com/ConduitPlatform/Conduit-UI/commit/864559c4e708f4f86a1004e1a8e45302c7b6fbd8))
* chat styles ([#134](https://github.com/ConduitPlatform/Conduit-UI/issues/134)) ([eef3f7d](https://github.com/ConduitPlatform/Conduit-UI/commit/eef3f7dea7543caff0379ab93a03e7fec1784c92))
* close logs component by clicking title ([#164](https://github.com/ConduitPlatform/Conduit-UI/issues/164)) ([5f385d1](https://github.com/ConduitPlatform/Conduit-UI/commit/5f385d1e56ce80dff68fdecb21666cbda5b8a11d))
* delete schema counter ([#168](https://github.com/ConduitPlatform/Conduit-UI/issues/168)) ([0d7deaf](https://github.com/ConduitPlatform/Conduit-UI/commit/0d7deaf02f81508c42c4055dbc816d08228d680a))
* delete schema request params ([#167](https://github.com/ConduitPlatform/Conduit-UI/issues/167)) ([96fe576](https://github.com/ConduitPlatform/Conduit-UI/commit/96fe576b2c3d8594aed3d284e36fdb0c1813f867))
* disabled module duplicate snackbar ([#140](https://github.com/ConduitPlatform/Conduit-UI/issues/140)) ([04a9e78](https://github.com/ConduitPlatform/Conduit-UI/commit/04a9e7823c75d3ad79d055b4cc18e34d72086b75))
* empty list message, widget height ([#144](https://github.com/ConduitPlatform/Conduit-UI/issues/144)) ([ea13c9e](https://github.com/ConduitPlatform/Conduit-UI/commit/ea13c9e5b30c47e7c3b5d086180ce9ba72db9a27))
* General Fixes ([#163](https://github.com/ConduitPlatform/Conduit-UI/issues/163)) ([8138434](https://github.com/ConduitPlatform/Conduit-UI/commit/8138434163065cc71f426dba359f8b8d171e9ecf))
* **Latency:** Home latency fix ([#149](https://github.com/ConduitPlatform/Conduit-UI/issues/149)) ([aa44639](https://github.com/ConduitPlatform/Conduit-UI/commit/aa446392d6171629d4ca1e0e86bee7a3c5063d4b))
* log colors ([74eeb8c](https://github.com/ConduitPlatform/Conduit-UI/commit/74eeb8c8d0615624db8719a6445d8399484153c5))
* logs component drag issue ([#158](https://github.com/ConduitPlatform/Conduit-UI/issues/158)) ([2e03af6](https://github.com/ConduitPlatform/Conduit-UI/commit/2e03af6f6c3e62614db852aebb8f3b14f29f2bee))
* logs component responsiveness ([#142](https://github.com/ConduitPlatform/Conduit-UI/issues/142)) ([8b52d52](https://github.com/ConduitPlatform/Conduit-UI/commit/8b52d52a5ed80e600eac3fbff402dbfe0a2acc50))
* logs drawer ([39268dd](https://github.com/ConduitPlatform/Conduit-UI/commit/39268dd7d0e4781b1c26094db82db08499171333))
* logs drawer max height ([#122](https://github.com/ConduitPlatform/Conduit-UI/issues/122)) ([067f419](https://github.com/ConduitPlatform/Conduit-UI/commit/067f4192554806d8231792b308baaeba7046bc15))
* **Metrics:** metric improvements ([#172](https://github.com/ConduitPlatform/Conduit-UI/issues/172)) ([0bd1720](https://github.com/ConduitPlatform/Conduit-UI/commit/0bd17204496be508ef15b4cb1c665d90f6c522d1))
* parameters of requests ([#125](https://github.com/ConduitPlatform/Conduit-UI/issues/125)) ([19de1f1](https://github.com/ConduitPlatform/Conduit-UI/commit/19de1f188b31da5112959d407e02e23e13e13a6b))
* phone number regular expression ([#133](https://github.com/ConduitPlatform/Conduit-UI/issues/133)) ([3530d8a](https://github.com/ConduitPlatform/Conduit-UI/commit/3530d8a8901d9f92c53bf4d6cdaf568b6b04924b))
* prometheus url ([#127](https://github.com/ConduitPlatform/Conduit-UI/issues/127)) ([02a2fce](https://github.com/ConduitPlatform/Conduit-UI/commit/02a2fce0ab131cd0814a518efd2fe0ad65188371))
* remove instance from logs ([#124](https://github.com/ConduitPlatform/Conduit-UI/issues/124)) ([781b4e6](https://github.com/ConduitPlatform/Conduit-UI/commit/781b4e6769e0d24d6bf5f0d312c86c1ce041f8d3))
* removed settings page loader ([#161](https://github.com/ConduitPlatform/Conduit-UI/issues/161)) ([12c0008](https://github.com/ConduitPlatform/Conduit-UI/commit/12c0008c5e81dead34fcac0e123736d73c834d66))
* **settings:** fixed a bug where settings page was not accessible ([#160](https://github.com/ConduitPlatform/Conduit-UI/issues/160)) ([9ae3b4a](https://github.com/ConduitPlatform/Conduit-UI/commit/9ae3b4a6d9b0bb012e3a2f3cdfacf2feb7ee2575))
* **SignIn:** added gitlab to providers ([#169](https://github.com/ConduitPlatform/Conduit-UI/issues/169)) ([309024b](https://github.com/ConduitPlatform/Conduit-UI/commit/309024be578c24f856f685b9e34e947c3813b9d3))
* storage viewpager issue ([#154](https://github.com/ConduitPlatform/Conduit-UI/issues/154)) ([1766608](https://github.com/ConduitPlatform/Conduit-UI/commit/17666086a14849ce7bf7a9d861dc8f66a59ff364))
* swagger & graphql modal urls  ([2b8cc58](https://github.com/ConduitPlatform/Conduit-UI/commit/2b8cc5858159c7f690286f5bc8cef91d217a918a))
* **Tokens:** changed JWT to Bearer token as support was dropped ([#123](https://github.com/ConduitPlatform/Conduit-UI/issues/123)) ([2da043a](https://github.com/ConduitPlatform/Conduit-UI/commit/2da043a705cbb30cb53cf2fd85b95e0c504938fa))

### [0.14.1](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.14.0...v0.14.1) (2022-07-24)


### Features

* added turborepo build & dev pipelines ([#112](https://github.com/ConduitPlatform/Conduit-UI/issues/112)) ([85ba94c](https://github.com/ConduitPlatform/Conduit-UI/commit/85ba94ca52fb5d1e613eeaa73cd81e934e3667b0))


### Bug Fixes

* **Conduit-UI:** consistent config pages ([#111](https://github.com/ConduitPlatform/Conduit-UI/issues/111)) ([67356f6](https://github.com/ConduitPlatform/Conduit-UI/commit/67356f61fac4edc9c72679814f966c1c7a396d63))
* **settings:** change password using wrong endpoint ([#114](https://github.com/ConduitPlatform/Conduit-UI/issues/114)) ([94d44cc](https://github.com/ConduitPlatform/Conduit-UI/commit/94d44ccd501c6ad30ab8ee62f566633ebeffa62c))

## [0.14.0](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.13.1...v0.14.0) (2022-07-15)


### ⚠ BREAKING CHANGES

* **conduit-ui:** changes for 0.14

### Features

* conduit-ui package json scripts to build the ui library ([#102](https://github.com/ConduitPlatform/Conduit-UI/issues/102)) ([5b04111](https://github.com/ConduitPlatform/Conduit-UI/commit/5b04111b6e335a927279e728c3ee2410f723e81b))
* **global.css:** global css and scrollbar styles ([70d048b](https://github.com/ConduitPlatform/Conduit-UI/commit/70d048b3252e303e1303968503eeb6a3fa4e75ea))


### Bug Fixes

* **cancel button:** cancel button outlined ([6c6b61c](https://github.com/ConduitPlatform/Conduit-UI/commit/6c6b61ca4cb1a4aaea0e60f671a37638868f9f9c))
* **cancel button:** cancel button outlined ([8b2662d](https://github.com/ConduitPlatform/Conduit-UI/commit/8b2662d79b99395fa67ee114894dedef6334130e))
* **Conduit-UI:** admin url, graphql url, config patch ([f61898e](https://github.com/ConduitPlatform/Conduit-UI/commit/f61898e6b2dfd36a6321c8887d60a5f57a3a1876))
* **Conduit-UI:** server-side css ([#109](https://github.com/ConduitPlatform/Conduit-UI/issues/109)) ([9047cdd](https://github.com/ConduitPlatform/Conduit-UI/commit/9047cdd766a0847516ba54cebf5dc433719ecf7b))
* **CustomQueries:** fix overflow, select endpoint, styles ([61bca30](https://github.com/ConduitPlatform/Conduit-UI/commit/61bca306b94d654ddd269f2533f28d9ce0aacaf9))
* **home-introspection:** text, list styles ([5f3bd3f](https://github.com/ConduitPlatform/Conduit-UI/commit/5f3bd3f470a7b99caa9f1126024e0e7b15c2536d))
* **index:** primary/secondary experiments ([851bbe6](https://github.com/ConduitPlatform/Conduit-UI/commit/851bbe63795186b27996a99736469134a60228c0))
* **IntrospectionLayout:** duplicate import ([8c57161](https://github.com/ConduitPlatform/Conduit-UI/commit/8c571614031a3f4528ee049061bb6d835e31fcc1))
* **Multisect:** props for settings select styles ([1da43f1](https://github.com/ConduitPlatform/Conduit-UI/commit/1da43f1ddb1426dd29e7d08b79e35190f8559110))
* **Permissions:** changed namings, improved theme visisibility ([#101](https://github.com/ConduitPlatform/Conduit-UI/issues/101)) ([0a24df7](https://github.com/ConduitPlatform/Conduit-UI/commit/0a24df7ab35c7592929334f0035b6a071b01e0c1))
* **SchemaOverview:** grid responsiveness ([fc9facb](https://github.com/ConduitPlatform/Conduit-UI/commit/fc9facbd82dcb7368ad5e7369797ab7527a9948d))
* **SchemaOverview:** grid responsiveness and logo ([d4b9a48](https://github.com/ConduitPlatform/Conduit-UI/commit/d4b9a48896fef5fc4783ea8a3091d9dceae56b04))
* swapped primary/secondary colors ([79689e9](https://github.com/ConduitPlatform/Conduit-UI/commit/79689e9aa5498d5f0afeb2012301d722523c8cf3))
* **width of tables-tabs:** tables-tabs bigger width, styles ([ed8f073](https://github.com/ConduitPlatform/Conduit-UI/commit/ed8f0734acae88fe3364e43663f0b01ddc8f60ce))


* **conduit-ui:** changes for 0.14 ([9f25c09](https://github.com/ConduitPlatform/Conduit-UI/commit/9f25c096a4b0fdaf28ce24669eafc05725d77738))

### [0.13.1](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.13.0...v0.13.1) (2022-06-23)


### Bug Fixes

* **introspection:** loading ([#98](https://github.com/ConduitPlatform/Conduit-UI/issues/98)) ([dc96e54](https://github.com/ConduitPlatform/Conduit-UI/commit/dc96e547b4a245ca3857e9f4970a10a4f8d25050))
* **SchemaEditor:** confirmation dialog on exit, save is not possible … ([#97](https://github.com/ConduitPlatform/Conduit-UI/issues/97)) ([fefc614](https://github.com/ConduitPlatform/Conduit-UI/commit/fefc614983cf9af4b03324662e5abb99ba583371))

## [0.13.0](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.13.0-rc.1...v0.13.0) (2022-06-17)


### Features

* **Security:** better way to preview your security client notes, cop… ([#89](https://github.com/ConduitPlatform/Conduit-UI/issues/89)) ([c5c6f6f](https://github.com/ConduitPlatform/Conduit-UI/commit/c5c6f6fb9c44b86b4788ab6388184876d094e395))


### Bug Fixes

* **login:** login page ui refactor ([#95](https://github.com/ConduitPlatform/Conduit-UI/issues/95)) ([c2ed614](https://github.com/ConduitPlatform/Conduit-UI/commit/c2ed6147a506e49f107cb4035045d07bff015ca2))

## [0.13.0-rc.1](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.13.0-rc.0...v0.13.0-rc.1) (2022-06-14)


### Features

* **storage:** support aliyun oss config ([#87](https://github.com/ConduitPlatform/Conduit-UI/issues/87)) ([dccb367](https://github.com/ConduitPlatform/Conduit-UI/commit/dccb367ec0293537165d968142468a88a9910d9a))


### Bug Fixes

* **alias:** now an optional property updating client ([#85](https://github.com/ConduitPlatform/Conduit-UI/issues/85)) ([1c611ec](https://github.com/ConduitPlatform/Conduit-UI/commit/1c611ecacf6f847de8859c494b670dfe6a9f8d9f))
* **build:** defaults provider to local on  storage initialization ([#88](https://github.com/ConduitPlatform/Conduit-UI/issues/88)) ([abd42b4](https://github.com/ConduitPlatform/Conduit-UI/commit/abd42b48334255080e8ebc115ef4b4a343355fc8))

## [0.13.0-rc.0](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.12.3...v0.13.0-rc.0) (2022-06-07)


### ⚠ BREAKING CHANGES

* **conduit-ui:** client id/secret validation mechanism control (#70)

### Features

* **conduit-ui:** client id/secret validation mechanism control ([#70](https://github.com/ConduitPlatform/Conduit-UI/issues/70)) ([669495e](https://github.com/ConduitPlatform/Conduit-UI/commit/669495ee35324566a533bd62ef03a22ef1df463e))
* **conduit-ui:** new authentication module config options ([#69](https://github.com/ConduitPlatform/Conduit-UI/issues/69)) ([e56526e](https://github.com/ConduitPlatform/Conduit-UI/commit/e56526e72466920b7f2ff06a1879c6ceb2306479))
* **introspection:** introspection card on homepage ofr imported/foreign schemas ([#79](https://github.com/ConduitPlatform/Conduit-UI/issues/79)) ([a02283b](https://github.com/ConduitPlatform/Conduit-UI/commit/a02283bbea29739f4959c02c4b4575f86686054e))
* **introspection:** introspection UI ([#75](https://github.com/ConduitPlatform/Conduit-UI/issues/75)) ([19e80e6](https://github.com/ConduitPlatform/Conduit-UI/commit/19e80e68d974624caf2b35ae73f3f6b03943178c))
* **Loading:** added a new non intrusive loading animation ([#74](https://github.com/ConduitPlatform/Conduit-UI/issues/74)) ([8caf71e](https://github.com/ConduitPlatform/Conduit-UI/commit/8caf71e6f5ad529458567dc3735089beb3bef9fa))


### Bug Fixes

* **emailValidation:** workaround for working email regexp ([#71](https://github.com/ConduitPlatform/Conduit-UI/issues/71)) ([5272fae](https://github.com/ConduitPlatform/Conduit-UI/commit/5272fae029a23048b7fabd411888aa2bb40d0988))
* **Layout:** the config now comes from nextjs method getConfig on the client-side ([#81](https://github.com/ConduitPlatform/Conduit-UI/issues/81)) ([687c3de](https://github.com/ConduitPlatform/Conduit-UI/commit/687c3def35d80bdf1a10a7ec9f92d3aa24f812ef))
* **Schema-editor:** responsible thunk now has the option to not show error msg when not needed ([#83](https://github.com/ConduitPlatform/Conduit-UI/issues/83)) ([cce00cc](https://github.com/ConduitPlatform/Conduit-UI/commit/cce00cc375325e84ef05fc0ec283fcab8be3eff9))

### [0.12.3](https://github.com/ConduitPlatform/Conduit-UI/compare/v0.12.2...v0.12.3) (2022-04-29)


### Features

* **monorepo:** Conduit UI is now a monorepo ([#62](https://github.com/ConduitPlatform/Conduit-UI/issues/62)) ([a4931e4](https://github.com/ConduitPlatform/Conduit-UI/commit/a4931e450fbed2ab225e6ca2f3764b027364b4d8)), closes [#63](https://github.com/ConduitPlatform/Conduit-UI/issues/63)


### Bug Fixes

* **ui-components:** baseUrl in SwaggerModal ([cc3ea7d](https://github.com/ConduitPlatform/Conduit-UI/commit/cc3ea7df8c4fe665c73b4bd4dbc00607db05487b))
