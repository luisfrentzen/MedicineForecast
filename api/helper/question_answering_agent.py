
from sqlalchemy.orm import Session
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from langchain.chains import RetrievalQA, ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain import PromptTemplate, LLMChain
import json

dataset_path = 'hub://luisfrentzen/med'

chat_history = []

QA = None

def search_db():
    global QA

    if QA is None:
        embeddings = OpenAIEmbeddings()
        db = DeepLake(dataset_path=dataset_path, read_only=True, embedding_function=embeddings)
        retriever = db.as_retriever()
        retriever.search_kwargs['distance_metric'] = 'cos'
        retriever.search_kwargs['fetch_k'] = 100
        retriever.search_kwargs['maximal_marginal_relevance'] = True
        retriever.search_kwargs['k'] = 10
        model = OpenAI(temperature=0.0, max_tokens=-1)
        QA = ConversationalRetrievalChain.from_llm(model, retriever=retriever, return_source_documents=True)

    return QA

def question_answering(prompt: str) -> str:
    chat_history = []
    prompt = "Tuliskan semua penyakit dan masalah kesehatan dari semua dokumen yang diberikan"
    qa = search_db()
    result = qa({'question': prompt, "chat_history": chat_history})

    source_documents = result['source_documents']
    sickness = result['answer']

    print(str(result['answer']))
    print('=============================')

    template = """Tuliskan semua obat untuk mengatasi penyakit yang muncul di paragraf:  {question}"""
    prompt = PromptTemplate(template=template, input_variables=["question"])
    llm = OpenAI(temperature=0.0, max_tokens=256)
    qaa = LLMChain(prompt=prompt, llm=llm)
    result = qaa.run(str(result['answer']))

    result = str(result)
    result = result.replace('Obat untuk ', '')
    result = result.replace('Penyakit ', '')
    result = result.replace('\n', '')
    result = result.replace('\n2', '')
    result = result.replace('\n6', '')

    drugs = result

    print(result)
    print('=============================')

    template = """given Anatomical Therapeutic Chemical (ATC) Classification System categories:

    1. M01AB - Anti-inflammatory and antirheumatic products, non-steroids, Acetic acid derivatives and related substances
    2. M01AE - Anti-inflammatory and antirheumatic products, non-steroids, Propionic acid derivatives
    3. N02BA - Other analgesics and antipyretics, Salicylic acid and derivatives
    4. N02BE/B - Other analgesics and antipyretics, Pyrazolones and Anilides
    5. N05B - Psycholeptics drugs, Anxiolytic drugs
    6. N05C - Psycholeptics drugs, Hypnotics and sedatives drugs
    7. R03 - Drugs for obstructive airway diseases
    8. R06 - Antihistamines for systemic use


    Help me categorize the drugs mentioned in this text: {question}"""

    prompt = PromptTemplate(template=template, input_variables=["question"])
    llm = OpenAI(temperature=0.0, max_tokens=-1)
    qaa = LLMChain(prompt=prompt, llm=llm)
    result = qaa.run(str(result))

    # =================================================================

    # print(result)

    # chat_history.append((prompt, result['answer']))
    # ts = time.time()

    # if(result['answer'] == ' Saya tidak tahu.'):
    #     db_question_answer = models.QuestionAnswer(id=str(ts), question=str(prompt), answer=str(""), human_flag=False)
    # else:
    #     db_question_answer = models.QuestionAnswer(id=str(ts), question=str(prompt), answer=str(result['answer']), human_flag=False)
        
    # db.add(db_question_answer)
    # db.flush()
    # db.refresh(db_question_answer)
    # db.commit()

    # result['id_session'] = db_question_answer.id

    # ==============================================================================

    
    
    # result = "oxaban, Apixaban.\n\n1. Diabetes: A10BA - Biguanides, A10BB - Sulfonilureas, A10BX - Other oral antidiabetic drugs, A10BG - Glinides, A10BC - Thiazolidinediones, A10BD - Alpha-glucosidase inhibitors, A10BF - Glucagon-like peptide-1 (GLP-1) analogues, A10BH - Sodium-glucose cotransporter-2 (SGLT2) inhibitors, A10BE - Dipeptidyl peptidase-4 (DPP-4) inhibitors, A10BJ - Meglitinides.\n2. Kencing Tikus: P02CA - Praziquantel, P02CB - Niclosamide, P02CC - Albendazole, P02CD - Oxamniquine.\n3. Kardiovaskular: C10AA - Acetylsalicylic acid, C07 - Beta blocking agents, C09 - ACE inhibitors, C08 - Calcium channel blockers, C10B - HMG-CoA reductase inhibitors, C03 - Diuretics, C01 - Cardiac glycosides, B01AC - Antiplatelet agents.\n4. Jantung Iskemik: C10AA - Acetylsalicylic acid, C07 - Beta blocking agents, C09 - ACE inhibitors, C08 - Calcium channel blockers, C10B - HMG-CoA reductase inhibitors, C03 - Diuretics, C01 - Cardiac glycosides, B01AC - Antiplatelet agents.\n5. Stroke: B01AC - Antiplatelet agents, B01AC06 - Clopidogrel, B01AA - Warfarin, B01AC17 - Ticagrelor, B01AF - Direct thrombin inhibitors, B01AE - Factor Xa inhibitors."

    # source_documents = [
    #   {
    #     "page_content": "Komitmen jangka panjang dari pemerintah diperlukan untuk menyediakan fasilitas kesehatan serta informasi yang layak untuk masyarakat,\" ujar Angela Micah, asisten profesor dan co-lead bantuan pengembangan untuk tim pelacakan sumber daya kesehatan.\n\nSalah satu penanganan yang baik adalah alokasi dana dan sumber daya manusia untuk bisa membangun sistem kesehatan yang baik dan layak bahkan di wilayah terpencil sekali pun.\n\nSebab tenaga kesehatan merupakan garda terdepan dalam mengantisipasti berbagai isu kesehatan yang muncul.\n\n8. Diabetes \"Diabetes adalah salah satu penyakit penyebab komplikasi yang meningkatkan angka kematian di berbagai negara,\" ujar Ewerton Cousin, sarjana postdoctoral di tim penyakit tropis terabaikan dan penulis utama makalah The Lancet Diabetes & Endocrinology.\n\nMenurut beliau, ada berbagai pencegahan yang bisa dilakukan, seperti diet sehat setiap harinya, olahraga rutin, hingga edukasi diri terkait informasi risiko diabetes untuk jangka panjang.",
    #     "metadata": {
    #       "source": "data\\11 Isu Kesehatan Jadi Sorotan di 2023, Mulai Long.txt"
    #     }
    #   },
    #   {
    #     "page_content": "Ketiga, isu kesehatan kronis. Banyak isu kesehatan kronis yang perlu perbaikan segera di 2023. Tujuannya, untuk menciptakan ketahanan adekuat menghadapi munculnya pandemi lain.\n\nDari 10.000-an puskesmas di Indonesia, lebih dari 50 persen belum memiliki tenaga kesehatan sesuai standar dan hampir 600 puskesmas belum memiliki dokter. Padahal, fasilitas ini tulang punggung dan front-liner penting program kesehatan masyarakat dan individu, termasuk jika wabah menyerang.\n\nData kesehatan Indonesia juga tak solid. Ada perbedaan data antarinstitusi. Data jumlah dokter yang ada di Kemenkes berbeda dengan data Konsil Kedokteran Indonesia dan Ikatan Dokter Indonesia. Padahal, data elemen sangat penting saat berhadapan dengan wabah.",
    #     "metadata": {
    #       "source": "data\\Turbulensi Program Kesehatan 2023.txt"
    #     }
    #   },
    #   {
    #     "page_content": "6. Kemiskinan dalam kesehatan \"Tampaknya kemiskinan adalah 'ibu' dari ketimpangan kesehatan. Distribusi sumber daya yang tidak merata telah meluas karena perubahan iklim dan meningkatnya kekerasan.\n\nBaca Juga: Hindari Masalah Mata Akibat Menatap Layar Komputer dengan Yoga Mata\n\nNegara berpenghasilan rendah dan menengah disebut memiliki hasil kesehatan yang lebih buruk dibanding dengan negara berpenghasilan tinggi,\" ujar Mohsen Naghavi, profesor dan pemimpin tim untuk penyebab kematian, guncangan, penyebab menengah dan memperkirakan beban AMR.\n\nSalah satu penanganan yang bisa dilakukan terhadap hal ini adalah pemberian lapangan pekerjaan untuk yang membutuhkan serta akses kemudahan untuk siapapun ke fasilitas kesehatan untuk meningkatkan kualitas hidup.\n\n7. Sistem kesehatan yang belum maksimal \"Memperkuat sistem kesehatan secara global tetap menjadi aspek penting sebab dibutuhkan sistem kesehatan yang baik di setiap negara.",
    #     "metadata": {
    #       "source": "data\\11 Isu Kesehatan Jadi Sorotan di 2023, Mulai Long.txt"
    #     }
    #   },
    #   {
    #     "page_content": "6. Diabetes anak Kasus diabetes anak disebut terus meningkat sejak awal 2023 lalu. Bahkan, menurut IDAI, kasus diabetes ini meningkat hingga 70 kali sejak 2010 lalu.\n\nDari data yang dimiliki IDAI, sebanyak 1.645 anak menderita diabetes.\n\n7. Pengobatan alternatif Ida Dayak Baru-baru ini, dunia kesehatan Indonesia dihebohkan dengan Ida Dayak yang mengklaim bisa menyembuhkan berbagai masalah tulang. Pasiennya pun membludak, datang dari berbagai daerah dan diklaim bisa sembuh hanya dengan usapan minyak.\n\nHingga kini, pengobatan Ida Dayak masih diminati masyarakat.\n\n8. Penyakit kencing tikus Leptospirosis atau penyakit kencing tikus sempat mewabah di Jawa Timur. Sebanyak 249 orang terinfeksi penyakit ini dan sembilan orang meninggal dunia.\n\nPenyakit ini kerap muncul di musim hujan, terutama di daerah-daerah rawan banjir. Masyarakat pun diminta waspada agar tak terinfeksi penyakit kencing tikus.",
    #     "metadata": {
    #       "source": "data\\HARI KESEHATAN SEDUNIA.TXT"
    #     }
    #   },
    #   {
    #     "page_content": "Kita bisa menangani atau mengurangi dampak dari perubahan iklim, seperti makan lebih sehat dan menjaga sistem kekebalan tubuh agar terhindar dari berbagai penyakit akibat perubahan iklim.\n\n4. Penyakit kardiovaskular 'Penyakit kardiovaskular seperti penyakit jantung iskemik dan stroke adalah penyebab utama kematian secara global, terhitung 28 persen dari total kematian pada tahun 2021,\" ujar Christian Razo, sarjana postdoctoral di tim yang memperkirakan beban penyakit kardiovaskular dan penulis utama studi Burden of Proof.\n\nAda pencegahan yang bisa dilakukan terhadap penyakit kardiovaskular, yaitu menjaga tekanan darah agar tetap stabil, mengurangi kolesterol yang tinggi, berhenti merokok, menjaga berat badan ideal, hingga mengurangi polusi udara.\n\nPenanganan dari penyakit kardiovaskular pun beragam, ada baiknya segera konsultasi dengan dokter jika kita punya indikasi penyakit tersebut.",
    #     "metadata": {
    #       "source": "data\\11 Isu Kesehatan Jadi Sorotan di 2023, Mulai Long.txt"
    #     }
    #   },
    #   {
    #     "page_content": "Edukasi Tentang Dampak serta Cara Mengatasi Masalah Kesehatan Jiwa dan Psikososial Akibat COVID-19 Hendrawati Hendrawati, Iceu Amira, Sukma Senjaya, Indra Maulana, Udin Rosidin\n\nAbstract",
    #     "metadata": {
    #       "source": "data\\Edukasi Tentang Dampak serta Cara Mengatasi Masala.txt"
    #     }
    #   },
    #   {
    #     "page_content": "Bersosialisasi dengan orang terdekat juga bisa membantu kita mengurangi stres berkepanjangan yang bisa menyebabkan gangguan mental.\n\nTerakhir, memaafkan masa lalu dan melepaskan segala dendam adalah cara terbaik untuk kita bisa menjalani hari ini dengan baik.\n\n3. Dampak perubahan iklim \"Perubahan iklim memengaruhi kesehatan jutaan orang di seluruh dunia, dan lebih penting, perubahan iklim akan semakin parah sepanjang abad ini.\n\nBaca Juga: Fakta Baru Rokok Elektrik, Toksikolog UNAIR Sebut Bahayanya Lebih Rendah daripada Rokok Konvensional, Sampai 95 Persen Lebih\n\nTidak ada pencegahan yang bisa dilakukan terhadap perubahan iklim, yang bisa dilakukan manusia adalah kesiapsiagaan agar bisa menjaga kesehatan lebih baik saat perubahan iklim,\" ujar Michael Brauer, profesor afiliasi dan pimpinan tim untuk memperkirakan beban faktor risiko lingkungan, pekerjaan, dan pola makan.",
    #     "metadata": {
    #       "source": "data\\11 Isu Kesehatan Jadi Sorotan di 2023, Mulai Long.txt"
    #     }
    #   },
    #   {
    #     "page_content": "HARI KESEHATAN SEDUNIA Ramai-ramai Isu Kesehatan di Indonesia Setahun Terakhir CNN Indonesia Jumat, 07 Apr 2023 09:35 WIB\n\nJakarta, CNN Indonesia -- Hari Kesehatan Sedunia dirayakan setiap tanggal 7 April, bertepatan dengan hari kelahiran Organisasi Kesehatan Dunia (WHO). Tahun ini, merupakan tahun ke-75 Hari Kesehatan Sedunia dirayakan. Di Indonesia, Hari Kesehatan Sedunia juga dirayakan sebagai pengingat pentingnya menjaga kesehatan seluruh masyarakat. Apalagi, sejak pandemi Covid-19 melanda pada 2020 lalu, berbagai penyakit baru dan misterius juga terus berdatangan.\n\nTapi, bukan hanya penyakit yang mewarnai dunia kesehatan di Indonesia. Ada banyak peristiwa kesehatan yang juga terjadi sepanjang 2022 hingga 2023.\n\nUntuk lebih jelasnya, berikut berbagai peristiwa kesehatan yang terjadi sepanjang 2022 hingga 2023.",
    #     "metadata": {
    #       "source": "data\\HARI KESEHATAN SEDUNIA.TXT"
    #     }
    #   },
    #   {
    #     "page_content": "1. Long Covid \"Covid jangka panjang benar-benar jadi masalah kesehatan yang harus diperhatikan di tahun 2023.\n\nDampak kesehatan dari Covid jangka panjang pun seringkali mengganggu kemampuan seseorang untuk menjalani rutinitas seperti sekolah, pekerjaan, ataupun berhubungan dengan lingkungan sekitar,\" ujar Sarah Wulf Hanson, ilmuwan penelitian utama dari tim peningkatan kualitas non-fatal dan risiko dan penulis utama makalah JAMA.\n\nPada dasarnya Covid bisa dicegah dengan rutin menerapkan protokol kesehatan seperti pakai masker saat keluar rumah, menjaga jarak dengan orang lain, konsumsi makanan bergizi dan vitamin untuk menjaga sistem kekebalan tubuh, hingga hindari kontak langsung dengan orang yang terpapar.\n\nBaca Juga: Manfaat Puasa Sebulan Penuh, Tak Hanya Bagi Kesehatan Tapi Juga Emosi\n\nSelain itu, penanganan yang bisa diberikan pada orang yang sudah terpapar adalah dukungan diagnostik dan isolasi yang tepat dari dokter perawat primer.",
    #     "metadata": {
    #       "source": "data\\11 Isu Kesehatan Jadi Sorotan di 2023, Mulai Long.txt"
    #     }
    #   },
    #   {
    #     "page_content": "Penyakit tak menular (non-communicable diseases) juga masih terus jadi momok program kesehatan akibat tingginya tingkat morbiditas, mortalitas, dan beban yang ditimbulkan. Penyakit jantung, stroke, dan diabetes merupakan pembunuh utama dengan beban tinggi. Padahal, penyakit ini sebenarnya preventable, dapat dihindari dengan upaya promotif dan preventif yang adekuat dan berkesinambungan. Sayangnya, di negeri ini belum ada program khusus berskala nasional yang menyasar isu ini.\n\nDi negara-negara lain, ada National Obesity Program atau National Healthy Lifestyle Program, yang secara konsisten melakukan upaya promotif dan preventif pencegahan penyakit tak menular.\n\nPemerintah disebutkan juga telah menyiapkan exit strategy bila ternyata resesi terjadi di Indonesia.\n\nTurbulensi program",
    #     "metadata": {
    #       "source": "data\\Turbulensi Program Kesehatan 2023.txt"
    #     }
    #   }
    # ]

    # print(source_documents[0])

    # sickness = " Diabetes, penyakit kencing tikus, penyakit kardiovaskular, penyakit jantung iskemik, stroke, diabetes anak, penyakit tak menular, kemiskinan dalam kesehatan, sistem kesehatan yang belum maksimal, pengobatan alternatif, dan dampak perubahan iklim."

    # drugs = "1. Diabetes: Metformin, Insulin, Sulfonilurea, Glinida, Biguanida, Thiazolidinediones, GLP-1 Agonists, SGLT2 Inhibitors, DPP-4 Inhibitors, Meglitinides, Alpha-Glucosidase Inhibitors.2. Kencing Tikus: Praziquantel, Niclosamide, Albendazole, Oxamniquine.3. Kardiovaskular: Aspirin, Beta-Blockers, ACE Inhibitors, Calcium Channel Blockers, Statins, Diuretics, Nitrates, Antiplatelet Agents.4. Jantung Iskemik: Aspirin, Beta-Blockers, ACE Inhibitors, Calcium Channel Blockers, Statins, Diuretics, Nitrates, Antiplatelet Agents.5. Stroke: Aspirin, Clopidogrel, Warfarin, Ticagrelor, Rivar"

    # print(result)

    # print(type(source_documents))

    sd = []
    for i in range(len(source_documents)):
        sd.append(dict(source_documents[i]))

    json_dictionary = {'source_documents': sd, 'sickness': str(sickness), 'drugs': str(drugs), 'answer': str(result)}
    json_object = json.dumps(json_dictionary, indent=4)

    with open("dataset/LLM-output.json", "w") as outfile:
        outfile.write(json_object)

    return {'message': "successfully retrieve LLM answer in LLM-output.json"}

def get_result():
    with open('dataset/LLM-output.json') as json_file:
        data = json.load(json_file)
        return data
    
def relevant_docs(keyword):
    keyword = keyword.lower()
    with open('dataset/LLM-output.json') as json_file:
        data = json.load(json_file)
        data = data['source_documents']
        sd = []
        for i in range(len(data)):
            doc = data[i]
            if doc['page_content'].lower().find(keyword) >= 0:
                sd.append(dict(doc))

    return {'source_documents': sd}
