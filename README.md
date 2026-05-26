<div align="center"><img src="logo.png" height="100px"/></div>

# DiscoExplorer

A lightweight search engine for discourse relation corpora

## Introduction

DiscoExplorer is a simple search engine for datasets containing discourse relation annotations, for example in frameworks such as (enhanced) Rhetorical Structure Theory (RST/eRST), Penn Discourse Treebank (PDTB), Segmented Discourse Representation Theory (SDRT) and more. The software comes with a script to convert data into .json files for search, and supports the [DISRPT shared task](https://github.com/disrpt) format as input. Pre-indexed corpora are included in this repo for publicly available datasets in `data/`. Additional licensed datasets can be obtained from DISRPT but require licenses to get the underlying text.

You can check out the demo [here](https://gucorpling.org/discoexplorer/)

## Using

On [the demo site](https://gucorpling.org/discoexplorer/), select a dataset from the dataset chooser - you can combine any of the criteria below:

  *  Use the dropdowns to search by DISRPT relation label, original dataset label, relation direction, or signal types/subtypes (if available)
  *  Use the query box to search for exact or flexible sequences of tokens or annotations:
    * Every token can have four properties - `word|lemma|UPOS|deprel` - and you can use any subset of these contextually:
      * `Although` - searches for capitalized "Although" (unless 'case insensitive' is selecteed)
      * `leaves|leaf` - searches for "leaves" but only if the lemma is "leaf"
      * `|say` - searches for the lemma "say" (including "said", "says", etc.)
      * `|NOUN` - searches for any noun (you can use any of the [17 Universal POS tags](https://universaldependencies.org/u/pos/))
      * `|advcl` - searches for an adverbial clause (you can search for any [Universal Dependencies dependency relation](https://universaldependencies.org/u/dep/))
      * `if |ADJ|advcl` - find sequences like "if possible" ("if" followed by an adjective heading the adverbial clause)

You can also get aggregate statistics for any query, or the entire dataset by leaving the query empty, and using the Frequencies tab. To compare frequencies in two datasets, use the Compare tab.


## Building

If you want to edit the code and recompile it, you will need npm / yarn / vite to be set up. Install npm, clone the repo to a subfolder discoexplorer and run:

  * cd discoexplorer
  * npm install

You should now be able to test you build by running:

  * npm run dev
  
And open your browser to http://localhost:5173/discoexplorer/

## Running

DiscoExplorer is built to run on a webserver, but you can also run it locally. All computations except for getting the initial corpus data are done on the user's web browser - no compute resources are consumed on the server for searching.

### Running locally

Simply clone the repo and open `dist_local/index.html` in your local browser - it should run out of the box.

### Server installation

To run with a web server, you don't need to install anything additional - the compiled .js files will run without npm/yarn/vite etc. However if you want to run authentication for restricted corpora, you will need Python to run the sever-side authentication script.

1. Build the app as described above to obtrain the contents in `dist/`
2. Put the contents of `dist/` in the server folder you want to serve the tool from
3. Set up the virtual host or address in your web server (apache, nginx etc.), e.g. map /var/www/html/discoexplorer/ to https://yourdomain.com/discoexplorer
4. If you want to use datasets with restrictive licenses, set up a master password and location for additional corpora in `discoauth.py` and configure access to the path indicated in the python script
5. If doing 3., make sure to change `yourmasterpassword` to a sensible password on your production server


## Citing

To cite this tool in academic papers, please use the following citation:

Amir Zeldes (2026) DiscoExplorer: An Open Interface for the Study of Multilingual Discourse Relations. Proceedings of CODI-CRAC 2026. San Diego, CA, July 3 2026.

```bibtex
@inproceedings{zeldes2026discoexplorer,
  author    = {Amir Zeldes},
  title     = {{DiscoExplorer}: {A}n Open Interface for the Study of Multilingual Discourse Relations},
  booktitle = {Proceedings of CODI-CRAC 2026},
  address   = {San Diego, CA},
  month     = jul,
  day       = {3},
  year      = {2026}
}
```