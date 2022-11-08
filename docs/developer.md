# Developer Guide

## Algorithms

### Yolov5
1. Create industrial model

    ![Create industrial model based Yolov5](./assets/images/industrial_model_yolov5.png)

    ![Create industrial model based Yolov5](./assets/images/industrial_model_yolov5_2.png)

    **Model extra information**

    {
        "labels": [
            "license-plate", 
            "vehicle"
        ]
    }

2. Quickstart - train

    ![Quickstart train - Yolov5](./assets/images/quickstart_train_yolov5.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | data | /opt/ml/input/data/cfg/data.yaml | Data configuration file |
    | cfg | yolov5s.yaml | Model configuration file |
    | weight | yolov5s | Model weight file (if it is not existed yet and it is standard weight file, it will download automatically | 
    |project | /opt/ml/model/ | Model project directory |
    | name | tutorial | Model name |
    | img | 640 | Image size |
    | batch | 16 | Batch size |
    | epochs | 10 | Number of epochs |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | images | Yes | S3 URI of images which contains train, validation images |
    | labels | Yes | S3 URI of labels which contains train, validation labels |
    | cfg | Yes | S3 URI of cfg which contains data.yaml |
    | weights | No | S3 URI of weights which contains model file |

    **Sample data configuration file**
        
        train: /opt/ml/input/data/images/train/
        val: /opt/ml/input/data/images/valid/

        # number of classes
            nc: 2

        # class names
        names: ['license-plate','vehicle']

3. Quickstart - deploy

    ![Quickstart deploy - Yolov5](./assets/images/quickstart_deploy_yolov5.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | model_name | custom | Indicate if it is a custom model or pre-trained model. In case it is a custom model, the best.pt will be loaded from the specific location. Otherwise, pre-trained model file will be loaded. |
    | size | 415 | Chunk image size to be passed to model |

4. Quickstart - inference

    ![Quickstart inference - Yolov5](./assets/images/quickstart_inference_yolov5.png)

    **HTTP request**

    | Inference approach | HTTP Body | Comment |
    |---|---|---|
    | Raw image data | Bytes of image file | ContentType: image/png, image/jpg, image/jpeg |
    | S3 image data	| { “bucket”: [s3-bucket], “image_uri”: [s3-key] } | ContentType: application/json |

    **HTTP response**

    -   One row per object
    -   Each row is class x_center y_center width height format.
    -   Box coordinates must be normalized by the dimensions of the image (i.e. have values between 0 and 1)
    -   Class numbers are zero-indexed (start from 0). For example: 
            
            1 0.511271 0.571540 0.936967 0.631636
            0 0.887925 0.714687 0.072043 0.101056

### GluonCV
1. Create industrial model

    ![Create industrial model based GluonCV](./assets/images/industrial_model_gluoncv.png)

    ![Create industrial model based GluonCV](./assets/images/industrial_model_gluoncv_2.png)

    ![Create industrial model based GluonCV](./assets/images/industrial_model_gluoncv_3.png)

    **Model extra information**

    **Image search**
    {
        "task": "search"
    }

    **Image classification**
    {
        "task": "classification",
        "classes": [
            "tench",
            "goldfish",
            ...
        ]
    }

2. Quickstart - train

    ![Quickstart train - GluonCV](./assets/images/quickstart_train_gluoncv.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | classes |	10 | Number of classes |
    | batch_size | 8 | Batch size |
    | epochs | 20 | Number of epochs |
    | learning_rate | 0.001 | Learning rate |
    | momentum | 0.9 | Momentum |
    | wd | 0.0001 | wd |
    | num_workers | 8 |	Number of workers |
    | model_name | ResNet50_v2 | Pretrained model name |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | train | Yes | S3 URI of train images |
    | val | Yes | S3 URI of val images |
    | test | Yes | S3 URI of test images |

3. Quickstart - deploy

    **Image search**

    ![Quickstart deploy - GluonCV](./assets/images/quickstart_deploy_gluoncv.png)

    **Image classification**

    ![Quickstart deploy - GluonCV](./assets/images/quickstart_deploy_gluoncv_2.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | task | search	| Indicate if the task is search or classification
    | classes | 1000 | Number of classes |
    | model_name | ResNet50_v2 | Pretrained model name |

4. Quickstart - inference

    ![Quickstart inference - GluonCV](./assets/images/quickstart_inference_gluoncv.png)

    ![Quickstart inference - GluonCV](./assets/images/quickstart_inference_gluoncv_2.png)

    **HTTP request**

    | Inference approach | HTTP Body | Comment |
    |---|---|---|
    | Raw image data | Bytes of image file | ContentType: image/png, image/jpg, image/jpeg |
    | S3 image data	| { “bucket”: [s3-bucket], “image_uri”: [s3-key] } | ContentType: application/json |

    **HTTP response**

    -   If task is search, return 2048 dimension embedding vector.
    -   If task is classification, return top-k matched class id array.

### PaddleOCR
1. Create industrial model

    ![Create industrial model based PaddleOCR](./assets/images/industrial_model_paddleocr.png)

    ![Create industrial model based PaddleOCR](./assets/images/industrial_model_paddleocr_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - PaddleOCR](./assets/images/quickstart_train_paddleocr.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | classes |	10 | Number of classes |
    | batch_size | 8 | Batch size |
    | epochs | 20 | Number of epochs |
    | learning_rate | 0.001 | Learning rate |
    | momentum | 0.9 | Momentum |
    | wd | 0.0001 | wd |
    | num_workers | 8 |	Number of workers |
    | model_name | ResNet50_v2 | Pretrained model name |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train dataset |
    | pretrained_models | Yes | S3 URI of pretrained models |

3. Quickstart - deploy

    ![Quickstart deploy - PaddleOCR](./assets/images/quickstart_deploy_paddleocr.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | task | ocr | Indicate if it is an OCR task or structure task |
    | device | cpu | CPU or GPU device |
    | det_model_dir	| None | det model directory when it is an OCR task |
    | rec_model_dir	| None | Rec model directory when it is an OCR task |
    | table_model_dir | None | table model directory when it is an OCR task |
    | rec_char_dict_path | None | rec custom dictionary path when it is an structure task |
    | table_char_dict_path | None | table custom dictionary path when it is an structure task |
    | lang | ch	| language |
    | table	| True | Indicate if table recognition is enabled when it is a structure task |
    | layout | True | Indicate if layout recognition is enabled when it is a structure task |
    | ocr | True | Indicate if ocr recognition is enabled when it is a structure task |

4. Quickstart - inference

    ![Quickstart inference - PaddleOCR](./assets/images/quickstart_inference_paddleocr.png)

    **HTTP request**

    | Inference approach | HTTP Body | Comment |
    |---|---|---|
    | Raw image data | Bytes of image file | ContentType: image/png, image/jpg, image/jpeg |
    | S3 image data	| { “bucket”: [s3-bucket], “image_uri”: [s3-key] } | ContentType: application/json |

    **HTTP response**

    -   One row per text box
    -   Each row is in x_left_top, y_left_top, x_right_top, y_right_top, x_right_bottom, y_right_bottom, x_left_bottom, y_left_bottom format, for example:

            479,138,1871,138,1871,198,479,198,英开曼群岛商史泰博股份有限公司台灣分公司
            972,212,1386,219,1385,283,971,275,電子發票證明聨
            1021,304,1336,304,1336,353,1021,353,2022-01-06
            57,371,496,371,496,417,57,417,發票号碼:WP79071184
            1625,364,1771,364,1771,413,1625,413,格式:25
            61,424,646,424,646,470,61,470,實方名：網资讯股份有限公司
            54,477,429,477,429,523,54,523,統一编号:24549210
            57,530,157,530,157,576,57,576,地址:
            54,576,150,576,150,629,54,629,備:
            2029,629,2293,629,2293,668,2029,668,第1真/共1真
            921,678,1432,678,1432,724,921,724,視同正本,凡經改即無效
            1318,731,1400,731,1400,774,1318,774,軍價
            1579,731,1671,731,1671,774,1579,774,金额
            486,735,568,735,568,777,486,777,品名
            1064,735,1154,735,1154,774,1064,774,數量
            1986,728,2075,728,2075,781,1986,781,備
            1379,781,1493,781,1493,834,1379,834,11.43
            57,788,864,788,864,834,57,834,雄狮SIMBALION细字奇翼筆600/黑/1.0mm
            1196,788,1225,788,1225,837,1196,837,5
            1650,781,1761,781,1761,834,1650,834,57.14
            1196,834,1225,834,1225,897,1196,897,3
            1357,837,1489,837,1489,887,1357,887,100.00
            61,841,807,841,807,887,61,887,立强REGINA無耳三孔D型±/R8603D/黑
            1629,834,1761,834,1761,887,1629,887,300.00
            1196,887,1225,887,1225,950,1196,950,5
            1379,887,1489,887,1489,940,1379,940,56.19
            57,894,893,894,893,940,57,940,11孔透明萬能袋/A4/亮面/0.04mm/100张/包
            1620,888,1758,879,1762,932,1624,941,280.95
            1377,941,1489,931,1494,988,1382,997,15.24
            57,947,836,947,836,993,57,993,SDI小三角迥针0731B/25.4mm/70支/盒
            1196,947,1225,947,1225,989,1196,989,2
            1650,940,1761,940,1761,993,1650,993,30.48
            1379,996,1493,996,1493,1046,1379,1046,61.90
            54,1000,989,1000,989,1046,54,1046,3M小管芯隐形膠带810/19mmx32.9M/纸盒-3/4时
            1196,1000,1225,1000,1225,1042,1196,1042,1
            1650,996,1761,996,1761,1046,1650,1046,61.90
            57,1053,118,1053,118,1099,57,1099,/卷
            1379,1102,1489,1102,1489,1152,1379,1152,57.14
            54,1106,986,1106,986,1152,54,1152,3M大管芯OPP透明文具膠带502/18mmx36M/8卷
            1196,1109,1225,1109,1225,1144,1196,1144,1
            1650,1102,1761,1102,1761,1152,1650,1152,57.14
            61,1159,118,1159,118,1201,61,1201,/束
            1379,1201,1489,1201,1489,1254,1379,1254,85.72
            53,1208,996,1201,997,1250,54,1258,3M大管芯OPP透明封箱膠带/3036-6PK/48mmx36
            1629,1201,1761,1201,1761,1250,1629,1250,171.43
            1200,1215,1221,1215,1221,1247,1200,1247,2
            64,1265,236,1265,236,1303,64,1303,M/6卷/束
            1379,1303,1493,1303,1493,1356,1379,1356,10.48
            61,1311,857,1303,857,1353,61,1360,得力Deli彩色迥纹針/E39716/33mm/100支
            1650,1303,1761,1303,1761,1353,1650,1353,10.48
            51,2769,265,2777,263,2830,49,2822,銷售额合计
            1678,2776,2278,2773,2279,2822,1679,2826,970營業人用统一發票専用章
            125,2829,264,2829,264,2879,125,2879,營業税
            450,2833,536,2833,536,2875,450,2875,鹰税
            832,2833,957,2833,957,2872,832,2872,零税率
            1218,2833,1307,2833,1307,2875,1218,2875,免税
            1707,2829,2261,2829,2261,2875,1707,2875,48英曼群岛商史泰博股份
            50,2879,136,2879,136,2932,50,2932,總計
            1654,2879,2132,2879,2132,2925,1654,2925,1,018有限公司台灣分公司
            361,2928,954,2936,953,3010,360,3002,壹仟零壹拾捌元整
            1753,2928,2128,2925,2129,2974,1754,2978,統一编号:27946944
            54,2939,393,2939,393,2999,54,2999,總計新台
            1764,2985,1971,2985,1971,3024,1764,3024,负贵人：吴
            1754,3027,2279,3031,2278,3080,1753,3077,地址:新北市新莊區思源路60
            1752,3076,1912,3084,1909,3134,1749,3125,1号15楼

### CPT
1. Create industrial model

    ![Create industrial model based CPT](./assets/images/industrial_model_cpt.png)

    ![Create industrial model based CPT](./assets/images/industrial_model_cpt_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - CPT](./assets/images/quickstart_train_cpt.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | model_name_or_path | fnlp/cpt-large | Pretrained model name |
    | num_train_epochs | 10 | Number of epochs |
    | per_device_train_batch_size | 4 | Batch size per device |
    | text_column | text | Label of text column |
    | summary_column | summary | Label of summary column |
    | output_dir | /opt/ml/model | Output directory |
    | train_file | /opt/ml/input/data/dataset/train.json | Path of train file |
    | validation_file | /opt/ml/input/data/dataset/val.json | Path of validation file |
    | test_file	| /opt/ml/input/data/dataset/test.json | Path of test file |
    | val_max_target_length | 80 | Max target length | 
    | path | json | Extension name | 

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train dataset |

    **Content format of train/validation/test file**

        {
            “text”: <text>, 
            “summary”: <summary>
        }


3. Quickstart - deploy

    ![Quickstart deploy - CPT](./assets/images/quickstart_deploy_cpt.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | input_max_length | 512 | Maximum effective input length | 
    | output_max_length	| 512 | Maximum effective output length |
    | top_p	| 0.95 | Top probability of output summary |


4. Quickstart - inference

    ![Quickstart inference - CPT](./assets/images/quickstart_inference_cpt.png)

    **HTTP request**

        {
            “inputs”: “中国农业银行股份有限公司安远县支行与魏坤元、魏松兰等借款合同纠纷一审民事判决书 江西省安远县人民法院 民 事 判 决 书 （2017）赣0726民初928号原告中国农业银行股份有限公司安远县支行。 住所地：安远县欣山镇龙泉路12号。 法定代表人唐文中，系该行行长。 委托代理人严海，系该行工作人员。 代理权限：代为承认、放弃或者变更诉讼请求，进行和解、提起反诉或者上诉。 被告魏坤元，男，1957年9月9日生，汉族，江西省安远县人，住安远县。 被告魏松兰，男，1971年12月16日生，汉族，江西省安远县人，住安远县。 被告魏碧星，男，1982年1月20日生，汉族，江西省安远县人，住安远县。 原告中国农业银行股份有限公司安远县支行（以下简称农行安远支行）诉被告魏坤元、魏松兰、魏碧星借款合同纠纷一案，本院立案受理后，依法由审判员徐海峰适用简易程序，于2017年8月8日公开开庭进行了审理。 原告农行安远支行的委托代理人严海到庭参加了诉讼，被告魏坤元、魏松兰、魏碧星经本院传票传唤无正当理由未到庭参加诉讼。 本案现已审理终结。 原告农行安远支行诉称，被告魏坤元于2013年12月19日向原告申请农户小额最高额可循环贷款一笔，金额50000元，并由被告魏松兰、魏碧星提供保证担保，合同到期日为2016年12月18日，合同约定在最高额度和期限内，借款人随借随还，自助放款还款，单笔借款期限最长不超过一年。 合同期限内，借款人魏坤元于2015年12月23日通过原告自助电子渠道申请贷款一笔、金额50000元，到期日为2016年11月22日，至今仍结欠原告贷款本金50000元及827.95元（利息计算至2016年12月20日止）。 该笔贷款已逾期，为此，原告诉至法院，请求依法判令：1、被告魏坤元、魏松兰、魏碧星归还原告贷款本金50000元及利息827.95元（利息计算至2016年12月20日止），之后的利息按合同约定的罚息利率计算； 2、本案诉讼费用由被告承担。 被告魏松兰、魏碧星未作答辩。 被告魏坤元未到庭答辩，其在本院的《询问笔录》中辩称，对原告起诉没有异议，确实是和被告魏松兰、魏碧星组成联保小组，相互担保，被告魏碧星是被告魏坤元的儿子，被告魏松兰是被告魏坤元的堂弟。 三被告各向原告借款5万元，拖欠了本息至今。 经审理查明，2013年11月25日，被告魏坤元、魏松兰、魏碧星三人组成联保小组，相互承担连带保证责任向原告农行安远支行申请借款。 三被告组成联保小组后，被告魏坤元向原告借款50000元，并签订了《农户贷款借款合同》（以下简称《借款合同》），合同内容：“第一条借款金额/可循环借款额度（人民币大写）：伍万元。 用款方式：自助可循环方式。 自2013年12月19日起至2016年12月18日（额度有效期），借款人可在伍万元的可循环借款额度内向贷款人申请借款，单笔借款期限最长不超过壹年且到期日最迟不得超过额度有效期。 借款用途：生产经营。 第二条本合同项下，借款执行利率以借款发放当日中国人民银行同期同档次人民币贷款基准利率基础上浮30%确定。 1年期以内（含）的借款执行浮动利率。 1年期以上的借款执行浮动利率。 浮动利率指如遇中国人民银行人民币贷款基准利率调整，自基准利率调整之日起，按调整后相应期限档次的基准利率和本合同约定的借款利率浮动幅度确定新的借款执行利率，且不再另行通知借款人和担保人。 第五条保证方式为连带责任保证，保证期间为借款期限届满之日起二年。 第六条借款人未按约定期限归还借款本金，贷款人对逾期借款从逾期之日起在借款执行利率基础上上浮百分之伍拾计收罚息，直至本息清偿为止。 ……” ，三被告均在该《借款合同》上签名捺印。 合同期限内，被告魏坤元于2015年12月23日借到原告农行安远支行发放的借款本金50000元，借款凭证上载明借款金额为伍万元整，执行利率为5.655％，逾期利率为8.4825%，借款日期为2015年12月23日，到期日期为2016年11月22日。 被告魏坤元借款后，经原告多次催款，截至2017年6月20日，仍拖欠原告借款本金50000元及利息2993.36元。 上述事实，有原告的陈述，原告提交的《借款合同》、《中国农业银行借款凭证》、《联合保证担保承诺书》、《中国农业银行农户小额贷款业务申请表》、《中国农业银行农户小额贷款面谈记录》、《本息清单》等证据予以证实，上述证据经庭审审查，能相互印证，本院予以确认。 本院认为，被告魏坤元向原告农行安远支行借款，双方签订了借款合同，原告也依约向被告魏坤元发放了借款，由此形成的借款合同关系合法有效，受法律保护。 借款到期后，被告魏坤元应清偿借款本金并依约支付利息，但其至今未还清借款本金及相应利息，其行为显属违约。 由于被告魏坤元、魏松兰、魏碧星三人组成联保小组，三被告中任一人借款均由其他二被告提供连带责任保证，即三被告相互承担连带保证责任。 因此，被告魏松兰、魏碧星二人应与债务人被告魏坤元承担连带偿还责任，依约偿还原告借款本金及相应利息。 综上，依照《中华人民共和国合同法》第一百零七条、第二百零四条、第二百零五条、第二百零七条，《中华人民共和国担保法》第十二条、第十八条、第二十一条，《中华人民共和国民事诉讼法》第一百四十四条之规定，判决如下：一、被告魏坤元于本判决生效后三十日内偿还原告中国农业银行股份有限公司安远县支行借款本金50000元及利息（截至2017年6月20日的利息为2993.36元，2017年6月20日之后的利息按照合同约定的罚息利率计算）。 二、被告魏松兰、魏碧星对上述款项承担连带偿还责任。 如果未按本判决指定的期间履行给付金钱义务，应当依照《中华人民共和国民事诉讼法》第二百五十三条之规定，加倍支付迟延履行期间的债务利息。 案件受理费1070元，减半收取535元，由被告魏坤元、魏松兰、魏碧星共同负担。 如不服本判决，可在判决书送达之日起十五日内，向本院递交上诉状，并按对方当事人的人数提出副本（在递交上诉状之日起七日内预交上诉费，缴交上诉费账号：99×××88，开户行：招商银行赣州长征大道支行，户名：江西省赣州市中级人民法院，备注栏注明上诉费），上诉于江西省赣州市中级人民法院。 （法律文书生效后，一方拒绝履行的，对方当事人向本院申请执行的期限是从判决书规定的履行期限届满二年内）审判员　　徐海峰 二〇一七年九月十一日 书记员　　李魁鹏”
        }


    **HTTP response**

        {
            “result”: “[SEP] [CLS] 原 被 告 系 借 款 合 同 纠 纷 。 原 告 提 出 诉 讼 请 求 ： 被 告 偿 还 原 告 贷 款 及 利 息 、 罚 息 ； 保 证 人 承 担 连 带 清 偿 责 任 。 被 告 未 答 辩 。 经 审 查 ， 原 告 与 被 告 签 订 的 农 户 贷 款 借 款 及 担 保 合 同 合 法 有 效 ， 被 告 应 当 按 照 合 同 约 定 履 行 偿 还 借 款 义 务 ， 否 则 原 告 对 被 告 抵 押 物 享 有 优 先 受 偿 权 。 综 上 ， 依 照 《 中 华 人 民 共 和 国 合 同 法 》 第 六 十 条 第 一 款 、 第 一 百 九 十 六 条 、 第 二 百 零 五 条 、 二 百 一 十 一 条 、 《 担 保 法 》 及 《 最 高 人 民 法 院 关 于 适 用 若 干 问 题 的 解 释 （ 二 ） 》 第 二 十 四 条 及 《 民 事 诉 讼 法 》 之 规 定 ， 判 决 被 告 给 付 原 告 农 户 最 高 额 可 循 环 贷 款 逾 期 利 息 及 罚 息 。 [SEP]”
        }

### GABSA
1. Create industrial model

    ![Create industrial model based GABSA](./assets/images/industrial_model_gabsa.png)

    ![Create industrial model based GABSA](./assets/images/industrial_model_gabsa_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - GABSA](./assets/images/quickstart_train_gabsa.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | task | uabsa | The name of the task, selected from: [uabsa, aste, tasd, aope] |
    | dataset | rest14 | The name of the dataset, selected from: [laptop14, rest14, rest15, rest16] |
    | model_name_or_path | t5-base | Pretrained model name |
    | paradigm | annotation | The way to construct target sentence, selected from: [annotation, extraction] |
    | do_train | True |	Whether to run training. |
    | do_eval | False | Whether to run eval on the dev/test set. |
    | do_batch_predict | False | Whether to run batch prediction. |
    | do_direct_eval | False | Whether to run direct eval on the dev/test set. |
    | do_direct_predict | False | Whether to run direct eval on the dev/test set. |
    | max_seq_length | 128 | Maximum sequence length |
    | train_batch_size | 16 | Batch train size |
    | eval_batch_size |	16 | Batch eval size |
    | gradient_accumulation_steps |	1 |	Number of updates steps to accumulate before performing a backward/update pass.
    | learning_rate	| 3e-4 | Learning rate |
    | num_train_epochs | 20	| Number of train epochs |
    | seed | 42 | seed |
    | ckpoint_path | /opt/ml/model/cktepoch=1.ckpt | Checkpoint path |
    | weight_decay | 0.0 | Weight decay |
    | adam_epsilon | 1e-8 | Adam epsilon |
    | warmup_steps | 0.0 | Warmup steps |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train dataset |

    **Content format of train/validation/test file**

        -   Each row contains origin string####[(word, aspect, sentiment),…], for example: 

            The wine list is interesting and has many good values .####[('wine list', 'drinks style_options', 'positive'), ('wine list', 'drinks prices', 'positive')]


3. Quickstart - deploy

    ![Quickstart deploy - GABSA](./assets/images/quickstart_deploy_gabsa.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | input_max_length | 512 | Maximum effective input length | 
    | output_max_length	| 512 | Maximum effective output length |
    | top_p	| 0.95 | Top probability of output summary |


4. Quickstart - inference

    ![Quickstart inference - GABSA](./assets/images/quickstart_inference_gabsa.png)

    **HTTP request**

        {
            "inputs": "The wine list is wonderful and the food reminds me of my recent trip to Italy ."
        }

    **HTTP response**

        {
            "result": "(wine list, drinks style_options, positive); (food, food quality, positive)"
        }

### PaddleNLP
1. Create industrial model

    ![Create industrial model based PaddleNLP](./assets/images/industrial_model_gabsa.png)

    ![Create industrial model based PaddleNLP](./assets/images/industrial_model_gabsa_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - PaddleNLP](./assets/images/quickstart_train_gabsa.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | batch_size | 16 | Batch size |
    | learning_rate | 1e-5 | Learning rate |
    | train_path | /opt/ml/input/data/dataset/train.txt	| Path of train file |
    | dev_path | /opt/ml/input/data/dataset/dev.txt	| Path of dev file |
    | max_seq_len | 512	Maximum sequence length |
    | num_epochs | 100 | Number of epochs |
    | seed | 1000 | seed |
    | logging_steps | 10 | Number of logging steps |
    | valid_steps | 100	| Number of validation steps |
    | device | gpu | CPU or GPU |
    | model	| uie-base | Pretrained model name |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train dataset |

    **Content format of train/validation/test file**

        -   Each row contains json string with content, result_list, and prompt, for example: 

                {
                    "content": "5月9日交通费29元从北苑到望京搜后", 
                    "result_list": [{"text": "5月9日", "start": 0, "end": 4}], 
                    "prompt": "时间"
                }



3. Quickstart - deploy

    ![Quickstart deploy - PaddleNLP](./assets/images/quickstart_deploy_gabsa.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | device | cpu | CPU or GPU
    | schema |    | Schema to inference |


4. Quickstart - inference

    ![Quickstart inference - PaddleNLP](./assets/images/quickstart_inference_gabsa.png)

    **HTTP request**

        {
            "inputs":"上海虹桥高铁到杭州时间是9月24日费用是73元"
        }

    **HTTP response**

        {
            "result": 
                [
                    {
                        "出发地": 
                            [
                                {
                                    "text": "上海",
                                    "start": 0, 
                                    "end": 2, 
                                    "probability": "0.99601215"
                                }
                            ], 
                        "目的地": 
                            [
                                {
                                    "text": "杭州", 
                                    "start": 7, 
                                    "end": 9, 
                                    "probability": "0.99965054"
                                }
                            ], 
                        "费用": 
                            [
                                {
                                    "text": "73元", 
                                    "start": 20, 
                                    "end": 23, 
                                    "probability": "0.79425305"
                                }
                            ], 
                        "时间": 
                            [
                                {
                                    "text": "9月24日", 
                                    "start": 12, 
                                    "end": 17, 
                                    "probability": "0.9998573"
                                }
                            ]
                    }
                ]
        }

### DeBERTa
1. Create industrial model

    ![Create industrial model based DeBERTa](./assets/images/industrial_model_deberta.png)

    ![Create industrial model based DeBERTa](./assets/images/industrial_model_deberta_2.png)

    **Model extra information**

    {}

2. Quickstart - deploy

    ![Quickstart deploy - DeBERTa](./assets/images/quickstart_deploy_deberta.png)

3. Quickstart - inference

    ![Quickstart inference - DeBERTa](./assets/images/quickstart_inference_deberta.png)

    **HTTP request**

        {
            "inputs": "如何有效学习？",
            "parameters":
                {
                    "candidate_labels":
                        [
                            "民生",
                            "文化",
                            "娱乐",
                            "体育",
                            "财经",
                            "房产",
                            "汽车",
                            "教育",
                            "科技",
                            "军事",
                            "旅游",
                            "国际",
                            "证券",
                            "农业",
                            "电竞"
                        ]
                }
        }

    **HTTP response**

        {
            "sequence": "如何有效学习？",
            "labels":
                [
                    "教育",
                    "文化",
                    "科技",
                    "民生",
                    "国际",
                    "汽车",
                    "军事",
                    "电竞",
                    "证券",
                    "财经",
                    "农业",
                    "体育",
                    "房产",
                    "娱乐",
                    "旅游"
                ],
            "scores":
                [
                    0.7116793990135193,
                    0.03544081375002861,
                    0.0295342355966568,
                    0.028479689732193947,
                    0.024489011615514755,
                    0.023759257048368454,
                    0.023078029975295067,
                    0.017534229904413223,
                    0.01741044595837593,
                    0.017365973442792892,
                    0.01681639440357685,
                    0.01475503295660019,
                    0.013634421862661839,
                    0.013062535785138607,
                    0.012960496358573437
                ]
        }

### KeyBert
1. Create industrial model

    ![Create industrial model based KeyBert](./assets/images/industrial_model_keybert.png)

    ![Create industrial model based KeyBert](./assets/images/industrial_model_keybert_2.png)

    **Model extra information**

    {}

2. Quickstart - deploy

    ![Quickstart deploy - KeyBert](./assets/images/quickstart_deploy_keybert.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | type | default| One of [sentence-transformer, huggingface-transformer, flair, spacy, universal-sentence-encoder, gensim, default]
    | model | - paraphrase-multilingual-MiniLM-L12-v2 when type is sentence-transformer <br> - en_core_web_trf when type is Spacy <br> - https://tfhub.dev/google/universal-sentence-encoder/4 when type is universal-sentence-encoder <br> - fasttext-wiki-news-subwords-300 when type is gensim | Model name |    |
    | huggingface_pipeline | feature-extraction when type is huggingface-transformer | HuggingFace pipeline |
    | mode | - doc-embedding when type is flair <br> - transformer when type is spacy | - Use document embeddeding model or word embedding model when type is flair <br> - Use non-transformer, transformer, transformer without GPU when type is spacy |
    | doc_embedding | roberta-base when type is flair | Document embedding |
    | word_embedding | crawl when type is flair | Word embedding |
    | keyphrase_ngram_start | 1 | Minimum length in words of generated keywords/keyphrases |
    | keyphrase_ngram_end | 1 | Maximum length in words of generated keywords/keyphrases |
    | stop_words | english | Stopwords to remove from the document |
    | top_n | 5 | Return the top n keywords/keyphrases |
    | min_df | 1 | Minimum document frequency of a word across all documents |
    | use_maxsum | False | Whether to use Max Sum Distance for the selection of keywords/keyphrases |
    | use_mmr | False | Whether to use Maximal Marginal Relevance (MMR) for the selection of keywords/keyphrases |
    | diversity | 0.5 | The diversity of the results between 0 and 1 if `use_mmr` is set to True |
    | nr_candidates | 20 | The number of candidates to consider if `use_maxsum` is set to True |
    | highlight | False | Whether to print the document and highlight its keywords/keyphrases |

3. Quickstart - inference

    ![Quickstart inference - KeyBert](./assets/images/quickstart_inference_keybert.png)

    ![Quickstart inference - KeyBert](./assets/images/quickstart_inference_keybert_2.png)

    **HTTP request**

        {
            "inputs": "近年来,嵌入式技术与无线网络技术深度结合,催生了可计算RFID、嵌入式传感网等新兴领域.这些系统由大量廉价的节点组成,应用前景广泛.在传统设计中,这些系统通常是根据应用定制的.根据应用定制的系统具有开发简便、运行高效等优点,但不适合未来大规模部署.这是因为如果这些系统跟应用密切绑定、难以更新,那么系统一经部署就难以更新其软件,从而阻碍了软件创新的进程.软件定义的思想可以有效解决该问题.当前,软件定义网络成为计算机网络中一个热门的研究领域.传感器网络的软件设计与因特网的软件设计存在诸多差异,其最大的差异在于,传感器网络主要以信息的采集为核心,而因特网主要以信息的传输为核心.此外,传感器节点还具有体积小、电池续航能力有限、价格低廉等特点.文中主要调研了设计软件定义传感器网络(Software-DefinedSensorNetworks,SDSNs)架构的相关工作,列举了在设计一个通用、高效的软件定义传感器网络架构时可能遇到的挑战,并回顾了一些有用的技术.这些技术有的来自于现有方案,有的能够直接被用来解决一部分挑战.此外,文中还从软件定义功能的角度,进一步地对目前通用、高效的软件定义传感器网络架构及其采用的技术进行了分类.我们认为,软件定义传感器网络架构将在已部署的网络中起到至关重要的作用,并带来一场新的技术变革."
        }

    **HTTP response**

        {
            "result": 
                [
                    [
                        "无线网络", 
                        0.6223
                    ], 
                    [
                        "计算机网络", 
                        0.447
                    ], 
                    [
                        "definedsensornetworks", 
                        0.4356
                    ], 
                    [
                        "技术", 
                        0.4297
                    ], 
                    [
                        "因特网", 
                        0.4001
                    ]
                ]
        }

### GluonTS
1. Create industrial model

    ![Create industrial model based GluonTS](./assets/images/industrial_model_gluonts.png)

    ![Create industrial model based GluonTS](./assets/images/industrial_model_gluonts_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - GluonTS](./assets/images/quickstart_train_gluonts.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    | algo-name | DeepAR | Algorithm name |
    | model-dir | 8 | /opt/ml/model |
    | output-dir | 20 | /opt/ml/output |
    | train | 0.001 | /opt/ml/input/data/dataset |
    | test | 0.9 | /opt/ml/input/data/dataset |
    | freq | 1D | frequence |
    | prediction-length | 2*14 | Prediction length |
    | context-length | 20*14 | Context length |
    | batch-size | 2048 | Batch size |
    | epochs | 100 | Number of epochs | 
    | num-batches-per-epoc | 2 | Number of batches per epochs |
    | learning-rate | 0.001 | Learning rate |
    | learning-rate-decay-factor | 0.5 | Learning rate decay factor |
    | patience | 10 | Patience |
    | minimum-learning-rate | 5e-5 | Minimum learning rate |
    | clip-gradient | 10 | Clip gradient |
    | weight-decay | 1e-8 | Weight decay |
    | init | xavier |    |
    | hybridize | False |    |
    | use-feat-dynamic-real | False |    |
    | use-feat-static-cat | False |    |
    | use-past-feat-dynamic-real | False |    |
    | cardinality |    |    |
    | use-log1p | False |    |

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train data |

3. Quickstart - deploy

    ![Quickstart deploy - GluonTS](./assets/images/quickstart_deploy_gluonts.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    | freq | 1H	|    |
    | target_quantile | 0.5 |    |
    | use_log1p | False |    |

4. Quickstart - inference

    ![Quickstart inference - GluonTS](./assets/images/quickstart_inference_gluonts.png)

    ![Quickstart inference - GluonTS](./assets/images/quickstart_inference_gluonts_2.png)

    ![Quickstart inference - GluonTS](./assets/images/quickstart_inference_gluonts_3.png)

    **HTTP request**

        {
            "inputs":
                [
                    {
                        "target":
                            [
                                12,28,12,0,56,12,8,12,28,4,24,8,12,4,4,8,16,4,24,12,16,16,4,24,12,12,16,24,8,16,12,40,12,32,24,8,8,8,20,20,32,20,16,16,8,24,32,12,16,4,4,28,12,24,20,12,44,32,36,20,24,28,40,84,52,20,20,64,36,44,28,24,32,12,44,72,50,15,35,80,75,24,60,42,12,18,60,54,72,49,72,88,24,88,90,33,22,9,54,88,117,136,99,80,50,110,88,44,44,36,63,72,108,63,60,55,66,33,120,55,12,100,80,117,72,135,55,77,120,66,121,132,72,0,60,77,50,136,40,88,99,77,275,168,26,80,110,130,140,130,187,110,204,220,144,204,60,36,156,220,154,279,297,374,132,192,182,266,140,156,247,228,360,270,209,104,247,364,420,255,240,225,300,338,352,429,273,336,270,390,570,544,765,208,336,405,434,364,416,256,368,493,408,666,1216,221,391,289,812,588,544,320,351,300,660,754,600,432,481,504,650,486,516,480,540,442,572,465,576,130,546,598,640,682,546,546,728,630,616,960,527,585,570,630,825,852,690,770,480,608,1072,1224,720,629,850,1037,988,767,935,900,1110,901,1560,2091,1008,833,1602,1785,1470,1365,1258,1152,1380,1332,2412,2320,1196,1350,1178,1136,117,363,846,595,1488,1691,2508,2992,725,1386,1701,1638,1548,1216,1360,1122,2180,1638,2814,2925,1363,902,1175,1320,1140,1292,1128,1134,1738
                            ],
                        "start": "1980-01-01 00:00:00",
                        "item_id": "T234",
                        "freq": "1M",
                        "prediction_length": 24
                    },
                    {
                        "target":
                            [
                                12,28,12,0,56,12,8,12,28,4,24,8,12,4,4,8,16,4,24,12,16,16,4,24,12,12,16,24,8,16,12,40,12,32,24,8,8,8,20,20,32,20,16,16,8,24,32,12,16,4,4,28,12,24,20,12,44,32,36,20,24,28,40,84,52,20,20,64,36,44,28,24,32,12,44,72,50,15,35,80,75,24,60,42,12,18,60,54,72,49,72,88,24,88,90,33,22,9,54,88,117,136,99,80,50,110,88,44,44,36,63,72,108,63,60,55,66,33,120,55,12,100,80,117,72,135,55,77,120,66,121,132,72,0,60,77,50,136,40,88,99,77,275,168,26,80,110,130,140,130,187,110,204,220,144,204,60,36,156,220,154,279,297,374,132,192,182,266,140,156,247,228,360,270,209,104,247,364,420,255,240,225,300,338,352,429,273,336,270,390,570,544,765,208,336,405,434,364,416,256,368,493,408,666,1216,221,391,289,812,588,544,320,351,300,660,754,600,432,481,504,650,486,516,480,540,442,572,465,576,130,546,598,640,682,546,546,728,630,616,960,527,585,570,630,825,852,690,770,480,608,1072,1224,720,629,850,1037,988,767,935,900,1110,901,1560,2091,1008,833,1602,1785,1470,1365,1258,1152,1380,1332,2412,2320,1196,1350,1178,1136,117,363,846,595,1488,1691,2508,2992,725,1386,1701,1638,1548,1216,1360,1122,2180,1638,2814,2925,1363,902,1175,1320,1140,1292,1128,1134,1738,1564,3427,3325,1482,1584,1449,2222,1836,1332,1584,1680,1869,2002,3190,2652,1568,966,1380,1794,1350,1577,1104,1188,1495
                            ],
                        "start":"1980-01-01 00:00:00",
                        "item_id": "T234",
                        "freq": "1M",
                        "prediction_length": 24
                    }
                ]
        }

    **HTTP response**

        {
            "result": 
                [
                    [
                        1930.8326416015625,
                        2290.176025390625,
                        2243.770263671875,
                        1112.35888671875,
                        1216.8353271484375,
                        1300.52587890625,
                        1319.37451171875,
                        1104.0013427734375,
                        1231.51611328125,
                        1281.2568359375,
                        1306.0784912109375,
                        1798.2593994140625,
                        1773.2158203125,
                        2148.71142578125,
                        2055.391357421875,
                        1097.5042724609375,
                        1143.5330810546875,
                        1365.8883056640625,
                        1335.6077880859375,
                        1208.5709228515625,
                        1230.0604248046875,
                        1293.724853515625,
                        1298.18798828125,
                        1691.08056640625
                    ],
                    [
                        1820.448974609375,
                        2697.013916015625,
                        2449.663818359375,
                        1375.6854248046875,
                        1132.6513671875,
                        1368.69091796875,
                        1617.199951171875,
                        1349.854248046875,
                        1284.10986328125,
                        1291.0433349609375,
                        1288.84130859375,
                        1595.6607666015625,
                        1741.90185546875,
                        2308.14013671875,
                        2105.67529296875,
                        1253.835205078125,
                        1139.4034423828125,
                        1357.335205078125,
                        1589.59228515625,
                        1372.781982421875,
                        1298.3154296875,
                        1244.7462158203125,
                        1267.4632568359375,
                        1574.6981201171875
                    ]
                ]
        }

### StyleGAN
1. Create industrial model

    ![Create industrial model based StyleGAN](./assets/images/industrial_model_stylegan.png)

    ![Create industrial model based StyleGAN](./assets/images/industrial_model_stylegan_2.png)

    **Model extra information**

    {}

2. Quickstart - train

    ![Quickstart train - StyleGAN](./assets/images/quickstart_train_stylegan.png)

    **Hyperparameters**

    | Hyperparameter | Default value | Comment |
    |---|---|---|
    |gpus|1|Num of GPUS|
    |snap|50|Number of GPUs to use [default: 1]|
    |metrics|fid50k_full|Comma-separated list or "none" [default: fid50k_full]|
    |seed|0|Random seed|
    |data||Training data (directory or zip)|
    |cond|false|Train conditional model based on dataset labels [default: false]|
    |subset|all|'Train with only N images|
    |mirror|false|Enable dataset x-flips|
    |config|auto|Base config, one of 'auto', 'stylegan2', 'paper256', 'paper512', 'paper1024', 'cifar'|
    |gamma||Override R1 gamma|
    |kimg||Override training duration|
    |batch||Override batch size|
    |aug|ada|Augmentation mode, one of 'noaug', 'ada', 'fixed'|
    |p||Augmentation probability for --aug=fixed|
    |target||ADA target value for --aug=ada|
    |augpipe|bgc|Augmentation pipeline|
    |resume|noresume|Resume training|
    |freezed|0|Freezed layers|
    |fp32||Disable mixed-precision training|
    |nhwc||Use NHWC memory format with FP16|
    |nobench||Disable cuDNN benchmarking|
    |allow-tf32||Allow PyTorch to use TF32 internally|
    |workers||Override number of DataLoader workers|

    **Input data configuration**

    | Channel name | Mandatory | Comment |
    |---|---|---|
    | dataset | Yes | S3 URI of train data |

3. Quickstart - deploy

    ![Quickstart deploy - StyleGAN](./assets/images/quickstart_deploy_stylegan.png)

    **Environment variables**

    | Environment variable | Default value | Comment |
    |---|---|---|
    |network||Pre-trianed network URL|

4. Quickstart - inference

    ![Quickstart inference - StyleGAN](./assets/images/quickstart_inference_stylegan.png)

    ![Quickstart inference - StyleGAN](./assets/images/quickstart_inference_stylegan_2.png)

    **HTTP request**

    {
        "inputs": {
            "trunc": "0.7325021066422363", 
            "seeds": "9,206,870,370"
        }
    }

    **HTTP response**

    [
        "s3://sagemaker-ap-east-1-034068151705/stylegan/inference/outputseed0370.png",
        "s3://sagemaker-ap-east-1-034068151705/stylegan/inference/outputseed0009.png",
        "s3://sagemaker-ap-east-1-034068151705/stylegan/inference/outputseed0870.png",
        "s3://sagemaker-ap-east-1-034068151705/stylegan/inference/outputseed0206.png"
    ]

### Yolov5PaddleOCR
1. Create industrial model

    ![Create industrial model based Yolov5PaddleOCR](./assets/images/industrial_model_yolov5paddleocr.png)

    ![Create industrial model based Yolov5PaddleOCR](./assets/images/industrial_model_yolov5paddleocr_2.png)

    **Model extra information**

    {}

2. Quickstart - inference

    ![Quickstart inference - Yolov5PaddleOCR](./assets/images/quickstart_inference_yolov5paddleocr.png)
