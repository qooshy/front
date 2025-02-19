$(document).ready(function() {
    let currentFilter = 'all';  
    let currentThreshold = 0.0; 
    let moviesData = []; 

    function loadMovies() {
        $.ajax({
            url: 'http://localhost:3000/public/films.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                moviesData = data;
                updateMovies();
                updateFilmSelect();
            },
            error: function(xhr, status, error) {
                console.error("Erreur de chargement des films :", error);
                $('#movies-list').html('<p>Erreur de chargement des films. Vérifiez votre serveur.</p>');
            }
        });
    }

    function updateMovies() {
        const container = $('#movies-list');
        container.empty();

        const template = document.getElementById('movie-template');
        const flopTemplate = document.getElementById('flop-template');

        $.each(moviesData, function(i, movie) {
            let instance;

            if (currentFilter === 'flops' && parseFloat(movie.note) < currentThreshold) {
                instance = document.importNode(flopTemplate.content, true);
            } else if (currentFilter === 'classics' && parseFloat(movie.note) >= currentThreshold) {
                instance = document.importNode(template.content, true);
            } else if (currentFilter === 'all') {
                instance = document.importNode(template.content, true);
            } else {
                return;
            }

            $(instance).find('.nom').text(movie.nom || 'N/A');
            $(instance).find('.image').attr('src', movie.lienImage || '/img/default.jpg');
            $(instance).find('.origine').text('Origine: ' + (movie.origine || 'N/A'));
            $(instance).find('.annee').text('Année de sortie: ' + (movie.dateDeSortie || 'N/A'));
            $(instance).find('.realisateur').text('Réalisateur: ' + (movie.realisateur || 'N/A'));
            $(instance).find('.notePublic').text('Note du public: ' + (movie.notePublic || 'N/A'));
            $(instance).find('.note').text('Note de la critique: ' + (movie.note || 'N/A'));
            $(instance).find('.compagnie').text('Compagnie: ' + (movie.compagnie || 'N/A'));
            $(instance).find('.description').text('Description: ' + (movie.description || 'N/A'));

            container.append(instance);
        });
    }

    function updateFilmSelect() {
        const select = $('#film-select');
        select.empty();
        $.each(moviesData, function(i, movie) {
            select.append(`<option value="${movie.nom}">${movie.nom}</option>`);
        });
    }

    $('#show-all').click(function() {
        location.reload(); 
    });

    $('#show-classics').click(function() {
        currentFilter = 'classics';
        updateMovies();
    });

    $('#show-trash').click(function() {
        currentFilter = 'flops';
        updateMovies();
    });

    $('#range').on('input', function() {
        currentThreshold = parseFloat($(this).val());
        $('#note-value').text("Note : " + currentThreshold.toFixed(1)); 
        updateMovies();
    });

    $('#delete-film').click(function() {
        const filmToDelete = $('#film-select').val();
        if (!filmToDelete) return;

        moviesData = moviesData.filter(movie => movie.nom !== filmToDelete);
        updateMovies();
        updateFilmSelect();
    });

$('#show-add-movie-form-button').click(function() {
    $('#addFilmForm').toggle(); 
});


$(document).ready(function() {
    $('#addFilmForm').on('submit', function(event) {
        event.preventDefault();

        const titre = $('#titre').val();
        const genre = $('#genre').val();
        const annee = $('#annee').val();
        const note = $('#note').val();
        const realisateur = $('#realisateur').val();
        const origine = $('#origine').val();
        const compagnie = $('#compagnie').val();
        const description = $('#description').val();

        const formData = new FormData();
        formData.append('titre', titre);
        formData.append('genre', genre);
        formData.append('annee', annee);
        formData.append('note', note);
        formData.append('realisateur', realisateur);
        formData.append('origine', origine);
        formData.append('compagnie', compagnie);
        formData.append('description', description);

        $.ajax({
            url: '/ajouter-film',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                alert(response.message);
                $('#addFilmForm')[0].reset();
            },
            error: function(err) {
                alert('Erreur lors de l\'ajout du film');
            }
        });
    });
});


    loadMovies();
});
