const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Productos sincronizados con frontend/src/data/products.js
const products = [
  // ── CASCOS ──────────────────────────────────────────────────
  {
    name: "Casco Fox V3 RS",
    price: 350,
    image: "https://acdn-us.mitiendanube.com/stores/003/135/568/products/tox1-21a795e57d9ee00a3e17657650173959-640-0.webp",
    category: "cascos",
    stock: 8,
    description: "Casco motocross Fox V3 RS certificado con ventilación optimizada.",
  },
  {
    name: "Casco Bell MX9",
    price: 420,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6nqc0aQZ-_iqp2Vyw6wLm1Ox3H4JM0KTvDw&s",
    category: "cascos",
    stock: 5,
    description: "Casco Bell MX9 liviano con sistema EPS de seguridad.",
  },
  {
    name: "Casco Alpinestars SM10",
    price: 650,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-zHOlOdwQst565QU4eD6V78gVU41LXJlJfg&s",
    category: "cascos",
    stock: 4,
    description: "Casco premium Alpinestars SM10 de fibra de carbono.",
  },
  {
    name: "Casco Troy Lee Designs SE5",
    price: 580,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKGSfpum0R3DOCRrceF8H52DOW7SA7ct8G5Q&s",
    category: "cascos",
    stock: 6,
    description: "Diseño exclusivo Troy Lee Designs SE5 con protección MIPS.",
  },
  {
    name: "Casco Shoei VFX",
    price: 490,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDWlP_nDPFo-WbpsfP8_660gI6LPE2IzkADQ&s",
    category: "cascos",
    stock: 7,
    description: "Casco integral Shoei VFX con deflector de pescozo.",
  },

  // ── ESCAPES ─────────────────────────────────────────────────
  {
    name: "Escape Yoshimura RS12 CRF250",
    price: 1200,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAbQpgF7JFrtkqiMk2wDIrbftBTMdN0D26XQ&s",
    category: "escapes",
    stock: 3,
    description: "Sistema de escape completo Yoshimura RS12 en acero inoxidable.",
  },
  {
    name: "Escape FMF 4.1",
    price: 850,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdZriU2M0jZ8VBduB1Mo4bRgh8NLTNJt3GwA&s",
    category: "escapes",
    stock: 4,
    description: "Escape FMF 4.1 para motos 2 tiempos, ganancia en torque bajo.",
  },
  {
    name: "Escape Pro Circuit Ti-6 KX450",
    price: 1100,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU-xLsZi0ROfX1ANW_46Kt1jMDVbuoi938tw&s",
    category: "escapes",
    stock: 2,
    description: "Silenciador Pro Circuit Ti-6 de titanio de alta performance.",
  },
  {
    name: "Escape HGS Full System CRF450",
    price: 1400,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRI8UI1FM5RJne8PNq0QAF7IVCXirhlbdpYw&s",
    category: "escapes",
    stock: 2,
    description: "Sistema completo HGS de escape de competición.",
  },
  {
    name: "Escape FMF Powercore 4",
    price: 650,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5ECWs5OKCYYRSmPCFTEZ3lT9-C4l8tMXSjQ&s",
    category: "escapes",
    stock: 6,
    description: "Silenciador slip-on FMF Powercore 4 para motos 4T.",
  },

  // ── INDUMENTARIA ─────────────────────────────────────────────
  {
    name: "Pantalón Fox 360",
    price: 185,
    image: "https://images.openai.com/thumbnails/url/NHN0_XicDclJDoIwAADAFwGK7IkxSNgCKGGJ4g1KochWaIHob3yWv9G5zveDKMVE4zg4gPmFKSwZWgw8WxOa0wawYOw5gkaMm6E-Tcf_afqlVG0Q8V1gxU6dKutMkJ_ZfO_ZWG6N8CbH2ezogsO4FdmkZlqjd3ig_iq-FyatBDhtevQ8q6Yc7Fuc7wpzQ8s1FxXLNVbvcQdZIjFlNxWwoMlY_wD3GDl1",
    category: "indumentaria",
    stock: 10,
    description: "Pantalón Fox 360 MX con protecciones en rodillas.",
  },
  {
    name: "Pantalón Troy Lee Designs GP",
    price: 200,
    image: "https://images.openai.com/thumbnails/url/sr3-WXicDcnbCoIwAADQL_KCQaIQ4aU0BS_T5t4kp8xVzuWmkh_V__Q3dV7P99NLyYWtaR3D05vLrlVkwwyVCHmTFKt4HDTRj5xTRo6vw_9sJ2mtAOcl7c0t3RXPKoIVWBEHD2q2mBNLuLPPy67LzgMhkTstsYcuNNOrurEoWc0U-0W-1o1HMlZDIMTIwH4UCG1-sBjX0Mo9AOGJInknSarEhpLpuZy90DF_ffU-eA",
    category: "indumentaria",
    stock: 8,
    description: "Pantalón Troy Lee Designs GP ligero con tejido elástico.",
  },
  {
    name: "Jersey Fox 360",
    price: 90,
    image: "https://images.openai.com/thumbnails/url/NHNXbHicDclJDoIwAADAF7FpVCAxpgmbsggGApyMtNASaalQFfiNz_I3Otf5fogQfDQVpWZwmLmokSQqpsl4FDfRQhn2VBlJz3nL8OGx_58JImS4MHHpmW0C8PQzzJsOL7nUT0jfahZbLzukRlI4rbwMIVpHqhjCtLvMes7tkNAQG9bLccDRWQIYV-ur2xSssYKkTAkOQFHE5ckms-dHBN_fPw42Oaw",
    category: "indumentaria",
    stock: 15,
    description: "Jersey Fox 360 transpirable para verano.",
  },
  {
    name: "Jersey Alpinestars Racer",
    price: 95,
    image: "https://images.openai.com/static-rsc-1/PyzT8bE_yv_5aeVN1IJRaX8b8Dsvws0tS5etCGH444nSLs8aH2r7rSHU_7EVIvYeNdo4ase4STcgab5qzKnW6PdbY2KBlLsJMOQCnulXAOHWNZE-mqtRCVDrT6Kd4uweRHUclijhkYnvuhzW2q4lUC03Za7XMcvmzFjzO6h6WIpaWo_pHRLmGHKs1NlotBHhtkyDkciHPnUjIuPbUBpxRyO5y48GTTkBJz3cEqszP90",
    category: "indumentaria",
    stock: 12,
    description: "Jersey Alpinestars Racer oficial team con fit ajustado.",
  },
  {
    name: "Guantes Fox 180",
    price: 80,
    image: "https://images.openai.com/thumbnails/url/rPMnonicDcnhDkJAAADgJzoaJdlaI0VtunSm1R_j7nCb43ARD9K79Tb1_f2-n1JK0VuqSmvcTUJSAmRW60rRy1QyrOCGq33ZCMHqYtdu_2fZF7LxcCRmCIt9fMPPaWQz4OT45ukicH3H5PkpHukaeVfQOjHvXq4fZTTUK8OFGomSVVmNCEDz3Cae8Vgu0SG07aFP8wAZ2t1kQ_ADt_M1OQ",
    category: "indumentaria",
    stock: 20,
    description: "Guantes Fox 180 MX con palma reforzada.",
  },
  {
    name: "Guantes Alpinestars",
    price: 75,
    image: "https://images.openai.com/thumbnails/url/lLk4XnicDclJDoIwAADAFyEoikhiTFkDKFolbDcoWyWWKsVQXuV3_I3Odb6fljE6aKJYEfTilFWlwAoiLZqB5QyjBeof4tD2lGLSHJ77_2kgKHcOusZpeVJoCMfQSaeVzEfgkiaxAHQNdPEzT2nbLMO8Ph47fb1K8FSH6jX27vTkZoFpKzd21gUBejncAHkEKvH9on8t61iaVWxCfikiI-wm9zyjzossKL_treTAH23fPWE",
    category: "indumentaria",
    stock: 18,
    description: "Guantes Alpinestars training con grip premium.",
  },

  // ── BOTAS ────────────────────────────────────────────────────
  {
    name: "Botas Fox Comp",
    price: 280,
    image: "https://images.openai.com/thumbnails/url/mdL8tXicDcn_DkJAAADgJwpJlK21LDE_R4b8Y-7OuHFc7qx4ql6nt6nv3-_7aTmnTBfFeoDTQnmNNhwMW6FhvOIYCnAkImtHSvHQnJ-n_-mXAB0tmGjAyWLbcxOThJxYUv_yCu6uGK1ULW7s4csHOE9Ku9xdRHFD4ryXianue9mEWXjFHU1ngGDkk9gzHXtqyzk1wDDnPXgnqhNJzMBLoIUoTyrcybu1qJVN2fwA6R0_sw",
    category: "botas",
    stock: 9,
    description: "Botas de entrada MX Fox Comp con suela Vibram.",
  },
  {
    name: "Botas Alpinestars Tech 7",
    price: 450,
    image: "https://images.openai.com/thumbnails/url/N8645HicDclZCoJAGADgE6VlmgtEZIpLNYOlKL5Ijns4_urgcp1u1W3qe_2-n4oxGDWezykZVmB5tmEp3XPlyF6sJhzpWn6sOoCalqf--D_tjDLVIp483cKtG5pYB7Ia_l7cOVZTE_sqzsUCXiAKNUyC7-hBC5ZKC4aeburje6sIeIqkUJgvRrMSKYuQ6TuPAy1p0iVvMcZjLLs9tfEAFVpm5QcWYDmu",
    category: "botas",
    stock: 6,
    description: "Botas MX Alpinestars Tech 7 media caña con protección lateral.",
  },
  {
    name: "Botas Sidi Crossfire 3",
    price: 520,
    image: "https://images.openai.com/thumbnails/url/1HliKHicu9mYUVJSUGylr5-al1xUWVCSmqJbkpRnpJdeXJJYkpmsl5yfq1-ckV9QkJmXbl9oC5SzcvRLsXRPDixxSc3xDQ8JKs30DvQ0jHJNKajMCKsK9K4si_Qyi8oIDYuo8LJwcq4MNjH3dtbNSDHzTHP3y7IwczLw9M5J8011DnYtK67K8gUAgQQubA",
    category: "botas",
    stock: 4,
    description: "Botas de competición Sidi Crossfire 3 con sistemas de cierre rápido.",
  },
  {
    name: "Botas Gaerne SG-22",
    price: 480,
    image: "https://images.openai.com/thumbnails/url/-OTv9nicDcndEoFAGADQJ-pPJmrGGMSupJShdGPa3bbyU8t-DD2V1_E2nNvz_VQAQjqaVjT0_hZQMAVI01NLCTnUVKXtVZNVK0TdlOPb6H_OJGA2ojGHE1veUIznsbLsuOFdAB9sydZ0xhHz_bDpEyRcHYzOZHhvLbAwViIaZNlbOReEhK63Gbj3iLNo-JimSRIGTxSZ6XoLScCtY1w-Td-upVXleGOkO_LSAzMpf3d1PaA",
    category: "botas",
    stock: 5,
    description: "Botas de cuero italianas Gaerne SG-22 con forro interno.",
  },
  {
    name: "Botas Alpinestars Tech 3",
    price: 195,
    image: "https://images.openai.com/thumbnails/url/bOU7FnicDcnhDkJAAADgJ0KKGltrNw2xIon0x3C3Ozed4w7rcXqs3qa-v9_3Q6TkwtY0xJrxzSWCiqzZWsVCVrJt1KZ_aYL0nLcMH4b9_2xwgZbXJHPXIgaKihJspSZ0wihOA72sRpOCyMk2WC-6dH74Tz2YlYkMPAa7Ki2XPLyCo3R9z1BQVrCCekm3UArhybuP2zp3XEQtf7mdiZwEXhk_Eqs5oA",
    category: "botas",
    stock: 11,
    description: "Botas económicas Alpinestars Tech 3 ideales para trail y enduro.",
  },

  // ── PROTECCIONES ─────────────────────────────────────────────
  {
    name: "Pechera Thor",
    price: 220,
    image: "https://images.openai.com/thumbnails/url/Hen7pHicDcnbCoIwAADQLypFSp0QMS2CzFtCyl5EN0udbTPnra_qd_qbOq_n-6mkFL2lKCXDr0XIkqxkwbT1o5e5rPEa86fSV1yImj323e5_FvQJOOEYzvd6SgwqggQsUKRq3B25Y2huG-XO6FGWA1dPRz0T3IyLJmwc1xm8CYHwys0T6eDWm47MKC7v0g6mOjzYbNgiH9FRNX2QJpDYG9FlN3oOVDRXOG9pmJDoB7ZYPvc",
    category: "protecciones",
    stock: 9,
    description: "Peto de protección Thor con espaldar incluido.",
  },
  {
    name: "Rodilleras Fox Titan Pro",
    price: 120,
    image: "https://images.openai.com/static-rsc-1/Q_-1HheugdITLGHQtV5fTmDaFq44SeutBqOuvbrWu5zcmtuowSCEBKNxvPgkrUKqRow-VeWtGrHvDSp0oqCGM6P7LgoLlYJJ5xftfqQ9CFgMgUWd1HfSU_mvSj_CSH2Y8u6tMgDBbqUtlwXT-y43OV-5bKobwR4vpjvEJGfgjf1YgADS13FS9jsy6Ze7QuD1y3KBgnZWJHUbPVqVbAu-8w",
    category: "protecciones",
    stock: 14,
    description: "Rodilleras Fox Titan Pro con articulación libre de movimiento.",
  },
  {
    name: "Rodilleras Leatt GPX",
    price: 155,
    image: "https://images.openai.com/thumbnails/url/mKm-9nicDcnbCoIwGADgJ1JDV00hQswDExPspFeh2_CAuak_pj5U79Pb1Hf7fT8VgBwtTeMdHRYJnClQdIZajpBDTVUqXtpYCSnrrjz2h_9Z9pmZPr3CgGAgcULLJ1njdFVazBibOGURL1ajwbhqQ6zbg1ySjk_ZJroJvekXRclpfA8uU0Z2buwg4zR7rhMgFL29yk1mNJGtU5Q0feCRAw5uwT7sYfGFIKb9A1h4PeU",
    category: "protecciones",
    stock: 10,
    description: "Rodilleras certificadas Leatt GPX con espuma 3DF.",
  },
  {
    name: "Neck Brace Leatt 5.5",
    price: 390,
    image: "https://images.openai.com/thumbnails/url/6aqoZHicDclJDoIwAADAFxUUOAiJMRWVWk1ZRKDe2CwkUChtIvgSv-ZvdK7z_TRKjdLR9ZqX0zKqugKq4CuNSZWrttTKoddlM4xjy9lObP_nQFLZXnk7ch-4iSA0As-Ue01miwKnLHRv0aG7v_rYxB66rCF_D2c07evTdQPNhZAEz0Jl1LIMZDAjAunsShoiN37ktAsI8HGH2gD-ANuXNRM",
    category: "protecciones",
    stock: 5,
    description: "Collarín de seguridad Leatt 5.5 para competición.",
  },
  {
    name: "Coderas Thor",
    price: 85,
    image: "https://images.openai.com/thumbnails/url/_b1A_XicDclJDoIwAADAFwkFY4okxiAHqAIi4AIXImUpCUJpK1if46_8jc51vh8iBOWmqlY9ZpKKqlyIogdKw8VdtFjBw0PlZKC07ZvtuPmfaQXl2sGJAaU1jpEtIRzYUhyitzWHURNpLAvSmGguNjw5WUCGs-OmlKPzpE-7pLxdrpkcRtuBjfdadTrodvFeQB0Qjoocnbo6IQzwY43g9PRz6v8AVUA6Lw",
    category: "protecciones",
    stock: 16,
    description: "Coderas Thor con copa dura y interior suave.",
  },
  {
    name: "Cinturón Lumbar Fox",
    price: 65,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeJDiuBPdKnuFiRbzioocHr2nM5Mf-zsm5KA&s",
    category: "protecciones",
    stock: 13,
    description: "Faja lumbar Fox para largas jornadas de enduro.",
  },

  // ── ACCESORIOS ───────────────────────────────────────────────
  {
    name: "Antiparras Fox Main II",
    price: 120,
    image: "https://images.openai.com/thumbnails/url/we7UR3icu9mYUVJSUGylr5-al1xUWVCSmqJbkpRnqJdeXJJYkpmsl5yfq1-ckV9QkJmXbl9oC5SzcvRLsXRPDizOLU53T6syda1IzjYxdAkP9rEILnJzjgw3MnQ1DShOC3LLDPf2ya_SNTB094yvLC1OKs63iDLw9C-JLMxOL88IKTfzt4jMzgcAcjMuww",
    category: "accesorios",
    stock: 18,
    description: "Antiparras Fox Main II MX con lente doble anti-niebla.",
  },
  {
    name: "Antiparras 100% Racecraft",
    price: 185,
    image: "https://images.openai.com/thumbnails/url/6tZFxXicDcnbCoIwAADQL_KSNlAhIqMpoxQvpPkiOsc2aHPqSOyj-p_-ps7r-X6Y1moJLItIPG9Kk8HQvbRNuuhOc2ziUVgLG5Xikh6nw_-CUzL4Ec6k9-7CdE8MMLTeistnNYc5cTwDzfJyEwQVxatN6IooBkxEjGwJL1Cfi2xt-gyGZQokLLO8UhRhIna1reDiw4ft9qNy7rrJSXnl8QmDaaUydlNYn8EPK5A9zg",
    category: "accesorios",
    stock: 10,
    description: "Antiparras 100% Racecraft con tear-off system y lente Hiper.",
  },
  {
    name: "Puños ODI Lock-On",
    price: 45,
    image: "https://images.openai.com/thumbnails/url/f92glHicu9mYUVJSUGylr5-al1xUWVCSmqJbkpRnrJdeXJJYkpmsl5yfq1-ckV9QkJmXbl9oC5SzcvRLsXRPDnEyLAxNCgi3yC3zLEkq9S0qNytPDQmyLPbycSqIMHTxNQwztQj1TKrM8ArOzsh3zHLJNvUvCiotcwp08U9y9DeOzMh3K4x3zQYAfk4uvQ",
    category: "accesorios",
    stock: 30,
    description: "Puños ODI Lock-On de doble bloqueo anti-giro.",
  },
  {
    name: "Manubrio Renthal FatBar",
    price: 92,
    image: "https://images.openai.com/thumbnails/url/39Na5HicDcnbCoIwAADQL0onZZoQ4SWUCBW6mL6Izsvm3Jy6RP2c_qq_qfN6vh8kBB8NWS4ZHBYuymIjcgakehSZwFCCHZVH1HGOWX3qj_8zTL84uPAGSHK2MowcLyx3M3m3OXACm6DYZNq6sjZQ09p2F31ons7DGnFRRcudefnASeOlJqUvqNFJV93pWkV1-FSiiF60DGwVX00T6iZoHw9i7uEPglg60Q",
    category: "accesorios",
    stock: 15,
    description: "Manubrio Renthal FatBar de aluminio 7075 ultra liviano.",
  },
  {
    name: "Manijas de Freno y Embrague",
    price: 78,
    image: "https://images.openai.com/thumbnails/url/qqpqjnicDcn_DkJAAADgJzo_x7C1JqFRmKbwj3HEJRzOch6q9-lt6vv3-34aQvCssWzVw4liUpWAFD3H1DPJCYIMHDp2bgaMUV_vx93_NN0rVRtegxvIpsBqfSuWDbSowlT6aaw7HPcUKZDugV0UkfQynACtDeDTWcYgpdRVwi11DsJqy6Q-Re47f5Do2LXrdoYIKvZFV-liqqHjmVkZ86ZOk612YTH2YEvEH9CLPVQ",
    category: "accesorios",
    stock: 20,
    description: "Palancas de freno y embrague plegables CNC antirrotura.",
  },
  {
    name: "Cadena RK 520 Heavy Duty",
    price: 95,
    image: "https://images.openai.com/thumbnails/url/zt3VyHicu9mUUVJSUGylr5-al1xUWVCSmqJbkpRnrJdeXJJYkpmsl5yfq1-ckV9QkJmXbl9oC5SzcvRLsXRPDvbO9E4qqowPCnMqj0j2Nig18MoPLiyJLy31L6gqjAoutogK9fRx9Q8ISPUtdvJMyiz3CvOrcPGPTw4OzwsMKDQPqkgPjTLzTskEAN6FMCU",
    category: "accesorios",
    stock: 12,
    description: "Cadena de oro RK 520 Heavy Duty con sello X ring.",
  },
  {
    name: "Filtro de Aire Twin Air CRF250",
    price: 55,
    image: "https://images.openai.com/thumbnails/url/0P8eWXicDcnbCoIwAADQL_KytSiFCFPoYgY6bfokbQ41cFM3y_qc_qq_qfN6vp9G6165lsUFG1-95pWhqYBmrfRNt8xksrNUI_u-FfV22PzP9S6Vs2cY5nOqU4OWQ-TnM8kgSBcElb7kMeN3IwxsD9C4E8APT2J6JB7O8XSs7Qw5AOUIFu8gWe2iUdYBIYdBVV32vPqsSQZ0XuKiyADv6Doapx_4Fji2",
    category: "accesorios",
    stock: 25,
    description: "Filtro de espuma de alto flujo Twin Air CRF250 pre-oilado.",
  },
  {
    name: "Kit de Plásticos UFO CRF450",
    price: 285,
    image: "https://images.openai.com/thumbnails/url/m9rIrHicDcnbEkJAAADQL8rdFjNNUxqE3EqqNxZLTbuLrfBR_U9_U-f1fD81Y7TXeb7EsBspK4sZy7HMoZ5lrIEcJA--rwmlDUardvk_fe0XmgUPEhgNwW6Ia4tjJoTniMH2eD1sJrm7IOGu2hcbPJxarsDL6FplHj-J5no0U_NiBxxsxUNmwtM-QdhCR2BKb9ZHV9Gz6FYIZD9YpCDFyq2biDG8Qy1KFpXkGj_dazy2",
    category: "accesorios",
    stock: 6,
    description: "Kit completo de carenado replica team UFO CRF450.",
  },
  {
    name: "Pad Renthal KXF",
    price: 85,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0rzfLCnmN6nVMgaBpruLIY_7w-onEGik7zQ&s",
    category: "accesorios",
    stock: 15,
    description: "Pad de manubrio Renthal KXF para mayor confort y seguridad.",
  },
];

async function main() {
  console.log("Iniciando seed...");

  // Usuarios de prueba
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@motoshop.com" },
    update: {},
    create: { email: "admin@motoshop.com", password: hashedAdmin, name: "Administrador", role: "ADMIN" },
  });

  const hashedCliente = await bcrypt.hash("cliente123", 10);
  await prisma.user.upsert({
    where: { email: "cliente@motoshop.com" },
    update: {},
    create: { email: "cliente@motoshop.com", password: hashedCliente, name: "Cliente Prueba", role: "CLIENTE" },
  });

  // Insertar productos (solo si no existen por nombre)
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log(`${products.length} productos sincronizados con el catálogo del frontend.`);
  console.log("Usuarios creados:");
  console.log("  admin@motoshop.com / admin123  (rol: ADMIN)");
  console.log("  cliente@motoshop.com / cliente123  (rol: CLIENTE)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
